import React, { FC, useContext, useEffect, useState, useRef } from 'react';
import { Context } from '../index';
import { observer } from 'mobx-react-lite';
import NavBar from '../components/NavBar';
import Chart from 'chart.js/auto';
import 'chartjs-adapter-date-fns';
import { useParams } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

interface StockItem {
    sku: number;
    warehouse_name: string;
    item_code: string;
    item_name: string;
    free_to_sell_amount: number;
    // Add other properties as needed
}

const CalcPage: FC = () => {
    const { id } = useParams();
    const { store } = useContext(Context);
    const [productData, setProductData] = useState<any>(null);
    const [orderData, setOrderData] = useState<any[]>([]);
    const chartRef = useRef<HTMLCanvasElement | null>(null);
    const [stockData, setStockData] = useState<StockItem[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false); // Состояние загрузки
    const [result, setResult] = useState<any>(' ');
    const [clusterStocks, setClusterStocks] = useState<{ [key: string]: number }>({});
    const [finalResult, setFinalResult] = useState<{ [key: string]: number }>({});
    const [virtualStockResult, setVirtualStockResult] = useState<{ [key: string]: number }>({});
    const [totalVirtualStock, setTotalVirtualStock] = useState<number>(0);

    const sumMetrics = (data: any[]) => {
        return data.reduce((total, item) => total + (item.metrics ? item.metrics[0] : 0), 0);
    };

    const getClusterForWarehouse = (warehouseName: string): string => {
        const clusterMap: { [key: string]: string } = {
            "АДЫГЕЙСК_РФЦ": "Юг",
            "НОВОРОССИЙСК_МРФЦ": "Юг",
            "СОФЬИНО_РФЦ": "Центр",
            "ТВЕРЬ_ХАБ_КОНЯЕВСКАЯ_1": "Центр",
            "Тверь_РФЦ": "Центр",
            "Тверь_Хаб": "Центр",
            "Екатеринбург_РФЦ_НОВЫЙ": "Урал",
            "КРАСНОЯРСК_МРФЦ": "Сибирь",
            "Новосибирск_РФЦ_НОВЫЙ": "Сибирь",
            "Санкт_Петербург_РФЦ": "Санкт-Петербург и СЗО",
            "СПБ_БУГРЫ_РФЦ": "Санкт-Петербург и СЗО",
            "СПБ_ШУШАРЫ_РФЦ": "Санкт-Петербург и СЗО",
            "Казань_РФЦ_НОВЫЙ": "Поволжье",
            "НИЖНИЙ_НОВГОРОД_РФЦ": "Поволжье",
            "САМАРА_РФЦ": "Поволжье",
            "ГРИВНО_РФЦ": "Москва-Запад",
            "ПЕТРОВСКОЕ_РФЦ": "Москва-Запад",
            "ХОРУГВИНО_РФЦ": "Москва-Запад",
            "ЖУКОВСКИЙ_РФЦ": "Москва-Восток и Дальние регионы",
            "НОГИНСК_РФЦ": "Москва-Восток и Дальние регионы",
            "ПУШКИНО_1_РФЦ": "Москва-Восток и Дальние регионы",
            "ПУШКИНО_2_РФЦ": "Москва-Восток и Дальние регионы",
            "КАЛИНИНГРАД_МРФЦ": "Калининград",
            "АЛМАТЫ_МРФЦ": "Казахстан",
            "АСТАНА_РФЦ": "Казахстан",
            "ВОЛГОГРАД_МРФЦ": "Дон",
            "ВОРОНЕЖ_МРФЦ": "Дон",
            "ВОРОНЕЖ_2_РФЦ": "Дон",
            "Ростов_на_Дону_РФЦ": "Дон",
            "Хабаровск_РФЦ": "Дальний Восток",
            "ХАБАРОВСК_2_РФЦ": "Дальний Восток",
            "МИНСК_МПСЦ": "Беларусь",
        };
        return clusterMap[warehouseName] || "Неизвестно";
    };

    const calculateClusterStock = async () => {
        const clusterStocks: { [key: string]: number } = {};
        const filteredStockData = stockData.filter(item => item.sku === productData.sku && item.free_to_sell_amount !== 0);
        filteredStockData.forEach(item => {
            const cluster = getClusterForWarehouse(item.warehouse_name);
            if (cluster in clusterStocks) {
                clusterStocks[cluster] += item.free_to_sell_amount;
            } else { 
                clusterStocks[cluster] = item.free_to_sell_amount;
            }
        });

        console.log(clusterStocks);
        setClusterStocks(clusterStocks);
        return clusterStocks;
    };

    useEffect(() => {
        const fetchData = async () => {
            await store.checkAuth();
            try {
                const response = await store.info(id);
                setProductData(response);
            } catch (error) {
                console.error('Error while fetching product data:', error);
            }
        };
        fetchData();
    }, [store, id]);

    useEffect(() => {
        const getOrdered = async () => {
            try {
                if (productData) {
                    const response = await store.ordered(productData.sku);
                    setOrderData(response);
                    drawChart(response);
                }
            } catch (error) {
                console.error('Error while fetching product data:', error);
            }
        };
        getOrdered();
    }, [productData, store]);

    useEffect(() => {
        const fetchStock = async () => {
            try {
                if (productData) {
                    const response = await store.stock();
                    console.log(response)
                    setStockData(response || []);
                }
            } catch (error) {
                console.error('Error while fetching stock data:', error);
            }
        };
        fetchStock();
    }, [productData, store]);

    const drawChart = (data: any[]) => {
        if (!chartRef.current || !data) return;

        const labels = data.map(item => item.dimensions[0].id);
        const values = data.map(item => item.metrics[0]);

        new Chart(chartRef.current, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Заказано',
                    data: values,
                    fill: false,
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1
                }]
            },
            options: {
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            unit: 'day'
                        },
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        beginAtZero: true
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            title: () => ''
                        }
                    }
                },
                elements: {
                    line: {
                        borderWidth: 3
                    }
                },
                layout: {
                    padding: {
                        left: 10,
                        right: 10
                    }
                }
            }
        });
    };

    const handleCalculate = async () => {
        setIsLoading(true);
        try {
            const response = await store.getGeo(productData.sku);
            setResult({
                filteredData: response.filteredData,
                percentages: response.percentages
            });

            const orderMetricsSum = sumMetrics(orderData);
            const clusterStocks = await calculateClusterStock();

            const calculatedResult: { [key: string]: number } = {};
            Object.entries(response.percentages).forEach(([cluster, percentage]) => {
                calculatedResult[cluster] = parseFloat(((percentage / 100) * (orderMetricsSum / 30)).toFixed(2));
            });
            console.log('calculatedResult',calculatedResult)
            const finalResult: { [key: string]: number } = {};
            Object.entries(clusterStocks).forEach(([cluster, value]) => {
                const divisionResult = value / calculatedResult[cluster];
                if (!isNaN(divisionResult)) {
                    finalResult[cluster] = Math.round(divisionResult);
                }
            });

            // Проверим, что finalResult правильно заполнен
            console.log('Final Result:', finalResult);

            // Теперь вычтем значения из 120 и сохраним только положительные значения в virtualStockResult
            const virtualStockResult: { [key: string]: number } = {};
            Object.entries(finalResult).forEach(([cluster, value]) => {
                const virtualStock = Math.round((120 - value) * calculatedResult[cluster]);
                if (virtualStock > 0) {
                    virtualStockResult[cluster] = virtualStock;
                }
            });

            // Проверим, что virtualStockResult правильно заполнен
            console.log('Virtual Stock Result:', virtualStockResult);

            // Сохраним состояние
            setFinalResult(finalResult);
            setVirtualStockResult(virtualStockResult);
            setTotalVirtualStock(Object.values(virtualStockResult).reduce((acc, cur) => acc + cur, 0));

        } catch (error) {
            console.error('Error', error);
        } finally {
            setIsLoading(false);
        }
    };








    return (
        <>
            <NavBar />
            <div className="container" style={{ marginTop: '75px' }}>
                {productData && (
                    <>
                        <div className="row">
                            <div className="col-md-6">
                                <div className="card mb-3">
                                    <div className="card-body">
                                        <img src={productData.primary_image} alt={productData.name} className="img-fluid" />
                                        {/* <h2>Товарные остатки на: ~{productData ? Math.round(productData.stocks.present / (sumMetrics(orderData) / 30)) : 0} дней</h2> */}
                                        <button onClick={handleCalculate} className="btn btn-primary mt-3" disabled={isLoading}>
                                            Выполнить расчет
                                        </button>
                                        {isLoading && (
                                            <span className="spinner-border spinner-border-sm ms-2" role="status" aria-hidden="true"></span>
                                        )}
                                        {result && result.percentages && (
                                            <div className="row mt-3">
                                                <div>
                                                    <h3>Процент продаж по кластерам:</h3>
                                                    <ul>
                                                        {Object.entries(result.percentages).map(([key, value]) => (
                                                            <li key={key}>
                                                                <strong>{key}:</strong> {Number(value)}%
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="card mb-3">
                                    <div className="card-body">
                                        <h2>{productData.name}</h2>
                                    </div>
                                </div>
                                <div className="card mb-3">
                                    <div className="card-body">
                                        <canvas ref={chartRef} />
                                        <table className="table table-bordered table-striped">
                                            <thead className="thead-dark">
                                                <tr>
                                                    <th>Кластер</th>
                                                    <th>Склад</th>
                                                    <th>Доступно</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {stockData
                                                    .filter(item => item.sku === productData.sku && item.free_to_sell_amount !== 0) // Фильтр по free_to_sell_amount
                                                    .map((item, index) => (
                                                        <tr key={index}>
                                                            <td>{getClusterForWarehouse(item.warehouse_name)}</td> {/* Добавленный столбец */}
                                                            <td>{item.warehouse_name}</td>
                                                            <td>{item.free_to_sell_amount}</td>
                                                        </tr>
                                                    ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {result && result.percentages && Object.keys(finalResult).length > 0 && (
                            <div>
                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="card mb-3">
                                            <div className="card-body">
                                                <h3>Запасы на:</h3>
                                                {Object.entries(finalResult).map(([cluster, value]) => (
                                                    <div className="row mb-2" key={cluster}>
                                                        <div className="col-md-6">
                                                            <strong>{cluster}:</strong>
                                                        </div>
                                                        <div className="col-md-3">
                                                            <span style={{ color: value <= 30 ? "red" : value <= 60 ? "orange" : value <= 90 ? "green" : value <= 120 ? "orange" : "red" }}>
                                                                {value} дней
                                                            </span>
                                                        </div>
                                                        <div className="col-md-3">
                                                            {value <= 30 ? "Нужна поставка" : value <= 60 ? "Достаточно" : value <= 90 ? "Оптимально" : value <= 120 ? "Много" : "Избыточно"}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="card mb-3">
                                            <div className="card-body">
                                                <h3>Виртуальная поставка:</h3>
                                                <h4>Рекомендуемое количество:</h4>
                                                <span>
                                                    {totalVirtualStock} штук
                                                </span>
                                                {Object.entries(virtualStockResult).map(([cluster, value]) => (
                                                    <div className="row mb-2" key={cluster}>
                                                        <div className="col-md-6">
                                                            <strong>{cluster}:</strong>
                                                        </div>
                                                        <div className="col-md-6">
                                                            <span>
                                                                {value} штук
                                                            </span>
                                                        </div>

                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </>
    )
}
export default observer(CalcPage);
