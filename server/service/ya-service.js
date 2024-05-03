const dotenv = require('dotenv');
const fetch = require('node-fetch');

dotenv.config();

const { iamRepository } = require('../models/ya-model');

class yaService {
    constructor() {}

    async getTextCompletion(options = {}) {
        const response = await fetch('https://llm.api.cloud.yandex.net/foundationModels/v1/completion', {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${options.iamToken}`,
                'x-folder-id': options.folderId,
            },
            method: 'POST',
            body: JSON.stringify({
                "modelUri": `gpt://${options.folderId}/${options.model}`,
                "completionOptions": {
                    "stream": false,
                    "temperature": 0.2,
                    "maxTokens": "8000"
                },
                "messages": [
                    {
                        "role": "system",
                        "text": options.role,
                    },
                    ...options.messages
                ]
            }),
        });
        const result = await response.json();
    
        console.log();
    
        return result;
    }

    async getReview(stocks, orders, supply) {
        await iamRepository.init(process.env.YA_OAUTH_TOKEN);
        
        const compl = await this.getTextCompletion({
            iamToken: iamRepository.value,
            folderId: process.env.FOLDER_ID,
            model: 'yandexgpt/latest',
            role: 'assistant',
            messages: [
                {
                    role: 'assistant',
                    text: ` Нужно дать в одном сообщении ответ на несколько вопросов:
                    1)На складах озон остатки товара, которых хватет на ${supply} дней.
                    Выбери один вариант и выведи:
                    Если дней > 120 выведи что оборот низкий, поставка не требуется, возможно платное хранение
                    Если дней < 30 выведи что срочно нужна поставка. Возмонжо окончание остатков
                    Если дней > 30 но <120  выведи что нужно готовить поставку. Оборачиваемость нормальная.
                    Выводи просто результат без сравнения больше меньше.
                    2)Вывести из таблицы наименования складов где количество остатков меньше всего: ${stocks}. Посчитай правильно. Не дополняй ответ своими советами и лишней информацией.
                    3)выведи когда надо будет начинать готовить поставку через =  ${supply} - 30 дней `
                },
                // {
                //     role: 'assistant',
                //     text: `Выводи просто результат без сравнения больше меньше
                //     `
                // },
            ]
        });

        console.log(compl.result.alternatives[0].message.text);
        return compl.result.alternatives[0].message.text
    }
    async getMessage(name, options) {
        await iamRepository.init(process.env.YA_OAUTH_TOKEN);
        
        const compl = await this.getTextCompletion({
            iamToken: iamRepository.value,
            folderId: process.env.FOLDER_ID,
            model: 'yandexgpt/latest',
            role: 'Ты — маркетолог. Напиши описание товара для маркетплейса. Используй заданные название товара и ключевые слова',
            messages: [
                {
                    role: 'assistant',
                    text: `Создать подробное SEO описание товара с названием ${name} для продажи на маркетплейсе.
                    Не описывать характеристики.
                    Использовать ключевые слова подходящие по контексту и следующие: ${options}`
                },
            ]
        });

        console.log(compl.result.alternatives[0].message.text);
        return compl.result.alternatives[0].message.text
    }
}

module.exports = new yaService();

