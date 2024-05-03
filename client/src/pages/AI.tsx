import React, { FC, useContext, useEffect, useState, useRef } from 'react';
import { Context } from '../index';
import { observer } from 'mobx-react-lite';
import { IUser } from '../models/IUser';
import UserService from '../services/UserService';
import LoginForm from '../components/LoginForm';
import SecretForm from '../components/SecretForm';
import NavBar from '../components/NavBar';
import Chart from 'chart.js/auto';
import 'chartjs-adapter-date-fns';
import { useParams } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const AIPage: FC = () => {
    const { id } = useParams();
    const { store } = useContext(Context);
    const [productData, setProductData] = useState<any>(null);
    const [keywords, setKeywords] = useState<string>('');
    const [result, setResult] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false); // Состояние загрузки

    useEffect(() => {
        const fetchData = async () => {
            await store.checkAuth();
            try {
                const infoResponse = await store.info(id);
                const descResponse = await store.desc(id);
                const keyResponse = await store.keys(id)
                console.log(infoResponse);
                console.log(descResponse);
                console.log(keyResponse)
                setProductData({ info: infoResponse, desc: descResponse, keys: keyResponse });
            } catch (error) {
                console.error('Error while fetching product data:', error);
            }
        };
        fetchData();
    }, [store, id]);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsLoading(true); // Устанавливаем состояние загрузки в true
        try {
            const response = await store.aiDesc(
                productData?.info?.name,
                keywords
            );
            setResult(response); // Сохраняем результат в состояние
        } catch (error) {
            console.error('Error while generating AI description:', error);
        } finally {
            setIsLoading(false); // После завершения запроса устанавливаем состояние загрузки в false
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(result); // Копируем текст из textarea в буфер обмена
    };

    return (
        <>
            <NavBar />
            <div className="container" style={{ marginTop: '75px' }}>
                <h1>{productData && productData.info && productData.info.name}</h1>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label htmlFor="keywords" className="form-label">Введите ключевые слова через ";"</label>
                        <textarea
                            className="form-control"
                            id="keywords"
                            rows={6}
                            value={keywords || (productData?.keys || '')} // Используем значения keywords или из productData.keys
                            onChange={(e) => setKeywords(e.target.value)}
                            style={{ resize: 'none' }}
                        ></textarea>
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={isLoading}>Сгенерировать AI описание</button>
                    {isLoading && <span className="spinner-border spinner-border-sm ms-2" role="status" aria-hidden="true"></span>}
                </form>
                {result && (
                    <div className="mt-3">
                        {/* <label htmlFor="result" className="form-label">Результат</label> */}
                        <div className="input-group">
                            <textarea
                                className="form-control"
                                id="result"
                                rows={12}
                                value={result}
                                readOnly
                                style={{ resize: 'none' }}
                            ></textarea>

                        </div>
                        <button className="btn btn-outline-secondary mt-3" type="button" onClick={handleCopy} style={{ height: '38px' }}>Скопировать</button>
                    </div>
                )}
            </div>
        </>
    );
};

export default observer(AIPage);