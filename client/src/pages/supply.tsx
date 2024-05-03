import React, { FC, useContext, useEffect, useState } from 'react';
import { Context } from '../index';
import { observer } from 'mobx-react-lite';
import NavBar from '../components/NavBar';
import { Link } from 'react-router-dom'; // Импорт Link
import 'bootstrap/dist/css/bootstrap.min.css';

const SupplyPage: FC = () => {
    const { store } = useContext(Context);
    const [stockData, setStockData] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                await store.checkAuth();
                const response = await store.list();
                console.log(response);
                setStockData(response || []);
            } catch (error) {
                console.error('Error while fetching stock data:', error);
            }
        };

        fetchData();
    }, [store]);

    return (
        <>
            <NavBar />
            <div className="container" style={{ marginTop: '75px' }}>
                {stockData.map((item, index) => {

                    if (item.stocks.find((stock: any) => stock.type === 'fbo')?.present !== 0) {
                        return (
                            <div key={index} className="card mb-3">
                                <div className="card-body d-flex justify-content-between align-items-center">
                                    <div>
                                        <h5 className="card-title">Артикул: {item.product_id}</h5>
                                        <p className="card-text">Остаток FBO: {item.stocks.find((stock: any) => stock.type === 'fbo')?.present}</p>
                                    </div>
                                    <div>
                                        <Link to={`/supply/AI/${item.product_id}`} className="btn btn-primary" style={{ marginRight: '5px' }}>Контент</Link> {/* Первая кнопка */}
                                        <Link to={`/supply/${item.product_id}`} className="btn btn-primary">Расчет поставки</Link> {/* Вторая кнопка */}
                                        <Link to={`/supply/margin/${item.product_id}`} className="btn btn-primary">Рентабельность</Link> {/* Вторая кнопка */}
                                    </div>
                                </div>
                            </div>
                        );
                    }
                })}
            </div>
        </>



    )
}

export default observer(SupplyPage);
