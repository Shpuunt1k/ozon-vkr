import React, { FC, useContext, useEffect, useState } from 'react';
import { Context } from '../index';
import { observer } from 'mobx-react-lite';
import { useParams } from 'react-router-dom';
import NavBar from '../components/NavBar';
import 'bootstrap/dist/css/bootstrap.min.css';

const MarginPage: FC = () => {
    const { id } = useParams();
    const { store } = useContext(Context);
    const [productData, setProductData] = useState<any>(null);
    const [price, setPrice] = useState<number>();
    const [cost, setCost] = useState<number>();
    const [additionalInputs, setAdditionalInputs] = useState({
        costInYen: '',
        exchangeRate: '',
        purchaseServiceFee: '',
        deliveryRate: '',
        weight: '',
        packagingCost: '',
        exchangeRateRub: ''
    });
    const [tax, setTax] = useState<'USN_income' | 'USN_income_outcome'>('USN_income');
    const [advertising, setAdvertising] = useState<number>(10);
    const [roi, setRoi] = useState<number | null>(null);
    const [margin, setMargin] = useState<number | null>(null);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [showAdditionalInputs, setShowAdditionalInputs] = useState<boolean>(false);
    const [localizationIndex, setLocalizationIndex] = useState<number>(100);
    const mile = 0.055;
    const eq = 0.015;


    useEffect(() => {
        const fetchData = async () => {
            await store.checkAuth();
            try {
                const response = await store.info(id);
                console.log(response);
                setProductData(response);

            } catch (error) {
                console.error('Error while fetching product data:', error);
            }
        };
        fetchData();
    }, [store, id]);

    useEffect(() => {
        if (productData) {
            setPrice(Math.floor(productData.price)); // Округляем цену товара до целого числа
        }
    }, [productData]);

    const calculateLogisticsCost = () => {
        if (productData && productData.volume_weight < 5.0) {
            return 76;
        } else if (productData) {
            return Math.ceil(productData.volume_weight * 9) / 2;
        } else {
            return 0;
        }
    };

    const handleTaxChange = (value: 'USN_income' | 'USN_income_outcome') => {
        setTax(value);
    };

    const taxPercent = tax === 'USN_income' ? 6 : 15; // Выбираем процент в зависимости от выбранной налоговой системы

    const handleCalculate = () => {
        if (price !== undefined && advertising !== undefined) {
            let ozon_charge = price * (productData.commissions[0].percent / 100) + (price * mile) + (price * eq);
            
            // Учитываем индекс локализации только для части calculateLogisticsCost
            const index = localizationIndex;
            let logisticsCost = calculateLogisticsCost();
            if (index >= 0 && index <= 59) {
                logisticsCost *= 1.2;
            } else if (index >= 60 && index <= 64) {
                logisticsCost *= 1.1;
            } else if (index >= 75 && index <= 79) {
                logisticsCost *= 0.95;
            } else if (index >= 80 && index <= 84) {
                logisticsCost *= 0.9;
            } else if (index >= 85 && index <= 89) {
                logisticsCost *= 0.85;
            } else if (index >= 90 && index <= 94) {
                logisticsCost *= 0.8;
            } else if (index >= 95 && index <= 100) {
                logisticsCost *= 0.5;
            }
    
            ozon_charge += logisticsCost;
    
            let roi: number;
            let margin: number;
            let costValue: number;
    
            if (!showAdditionalInputs) {
                costValue = cost !== undefined ? cost : 0;
            } else {
                const { costInYen, exchangeRate, purchaseServiceFee, deliveryRate, weight, exchangeRateRub, packagingCost } = additionalInputs;
                costValue = parseFloat(costInYen) * parseFloat(exchangeRate) + (parseFloat(costInYen) * parseFloat(exchangeRate) * parseFloat(purchaseServiceFee) / 100) + parseFloat(deliveryRate) * parseFloat(weight) * parseFloat(exchangeRateRub) + parseFloat(packagingCost);
            }
    
            if (tax === 'USN_income') {
                roi = ((price - (price * advertising / 100) - costValue - ozon_charge - (price * 0.07)) / costValue * 100);
                margin = ((price - (price * advertising / 100) - costValue - ozon_charge - (price * 0.07)) / price * 100);
            } else {
                roi = ((price - (price * advertising / 100) - costValue - ozon_charge - ((price - ozon_charge - costValue) * 0.15)) / costValue * 100);
                margin = ((price - (price * advertising / 100) - costValue - ozon_charge - ((price - ozon_charge - costValue) * 0.15)) / price * 100);
            }
    
            setRoi(roi);
            setMargin(margin);
            setErrorMessage('');
        } else {
            setErrorMessage('Please fill in all the fields with valid numbers.');
        }
    };
    const toggleAdditionalInputs = () => {
        setShowAdditionalInputs(!showAdditionalInputs);
    };

    return (
        <>
            <NavBar />
            <div className="container" style={{ marginTop: '75px' }}>
                <div className="row">
                    <div className="col-md-6">
                        {productData && (
                            <div className="card mb-3">
                                <div className="card-body">
                                    <h3>{productData.name}</h3>
                                    <img src={productData.primary_image} alt={productData.name} className="img-fluid" />
                                </div>
                            </div>
                        )}
                        {productData && (
                            <div className="card mb-3">
                                <div className="card-body">
                                    <p>Комиссия категории: {productData.commissions[0].percent}%</p>
                                    <p>Стоимость логистики: {calculateLogisticsCost()} руб.</p>
                                    <p>Последняя миля (макс.): 5.5%</p>
                                    <p>Эквайринг: 1.5%</p>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="col-md-6">
                        <div className="card mb-3">
                            <div className="card-body">
                                <h3>Цена товара:</h3>
                                <input
                                    type="number"
                                    className="form-control mb-3"
                                    value={price !== undefined ? price : ''}
                                    onChange={(e) => setPrice(Math.floor(Number(e.target.value)))}
                                />
                                <h3>Индекс локализации</h3>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="1"
                                    value={localizationIndex !== undefined ? localizationIndex : '' } // Установите базовое значение в 100
                                    className="form-control mb-3"
                                    onChange={(e) => setLocalizationIndex(parseInt(e.target.value))}
                                />
                                <h3>Себестоимость:</h3>
                                {!showAdditionalInputs && (
                                    <input
                                        type="number"
                                        className="form-control mb-3"
                                        value={cost !== undefined ? cost : ''}
                                        onChange={(e) => setCost(Math.floor(Number(e.target.value)))}

                                    />
                                )}
                                {showAdditionalInputs && (
                                    <>
                                        <input
                                            type="number"
                                            className="form-control mb-3"
                                            placeholder="Стоимость в ¥"
                                            value={additionalInputs.costInYen}
                                            onChange={(e) => setAdditionalInputs({ ...additionalInputs, costInYen: e.target.value })}
                                        />
                                        <input
                                            type="number"
                                            className="form-control mb-3"
                                            placeholder="Курс (руб/¥)"
                                            value={additionalInputs.exchangeRate}
                                            onChange={(e) => setAdditionalInputs({ ...additionalInputs, exchangeRate: e.target.value })}
                                        />
                                        <input
                                            type="number"
                                            className="form-control mb-3"
                                            placeholder="Услуга выкупа, %"
                                            value={additionalInputs.purchaseServiceFee}
                                            onChange={(e) => setAdditionalInputs({ ...additionalInputs, purchaseServiceFee: e.target.value })}
                                        />
                                        <input
                                            type="number"
                                            className="form-control mb-3"
                                            placeholder="Курс доставки ($/кг)"
                                            value={additionalInputs.deliveryRate}
                                            onChange={(e) => setAdditionalInputs({ ...additionalInputs, deliveryRate: e.target.value })}
                                        />
                                        <input
                                            type="number"
                                            className="form-control mb-3"
                                            placeholder="Вес, кг"
                                            value={additionalInputs.weight}
                                            onChange={(e) => setAdditionalInputs({ ...additionalInputs, weight: e.target.value })}
                                        />
                                        <input
                                            type="number"
                                            className="form-control mb-3"
                                            placeholder="Курс (руб/$)"
                                            value={additionalInputs.exchangeRateRub}
                                            onChange={(e) => setAdditionalInputs({ ...additionalInputs, exchangeRateRub: e.target.value })}
                                        />
                                        <input
                                            type="number"
                                            className="form-control mb-3"
                                            placeholder="Упаковка, руб"
                                            value={additionalInputs.packagingCost}
                                            onChange={(e) => setAdditionalInputs({ ...additionalInputs, packagingCost: e.target.value })}
                                        />
                                    </>
                                )}
                                <button className="btn btn-link mb-3" onClick={toggleAdditionalInputs}>
                                    {showAdditionalInputs ? 'Скрыть доп. параметры' : 'Дополнительно'}
                                </button>
                                <h3>Налог:</h3>
                                <div className="input-group mb-3">
                                    <select
                                        className="form-select"
                                        value={tax}
                                        onChange={(e) => handleTaxChange(e.target.value as 'USN_income' | 'USN_income_outcome')}
                                    >
                                        <option value="USN_income">УСН Доходы</option>
                                        <option value="USN_income_outcome">УСН Доходы-расходы</option>
                                    </select>
                                    <span className="input-group-text">{taxPercent}%</span>
                                </div>
                                <h3>Реклама:</h3>
                                <div className="input-group mb-3">
                                    <input
                                        type="number"
                                        className="form-control"
                                        value={advertising}
                                        onChange={(e) => setAdvertising(Math.floor(Number(e.target.value)))}
                                    />
                                    <span className="input-group-text">%</span>
                                </div>
                                <button className="btn btn-primary" onClick={handleCalculate}>Посчитать</button>
                                {roi !== null &&

                                    <div className="mb-3 mt-3">
                                        <h4>Рентабельность: {roi.toFixed(1)}%</h4>
                                    </div>

                                }
                                {margin !== null &&
                                    <div className="mb-3 mt-3">
                                        <h4>Маржинальность: {margin.toFixed(1)}%</h4>
                                    </div>
                                }
                                {errorMessage && <p className="text-danger">{errorMessage}</p>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default observer(MarginPage);
