import React, { FC, useContext, useEffect, useState } from 'react';
import { Context } from '../index';
import { observer } from 'mobx-react-lite';
import NavBar from '../components/NavBar';
import 'bootstrap/dist/css/bootstrap.min.css';

interface StockItem {
    sku: number;
    warehouse_name: string;
    item_code: string;
    item_name: string;
    free_to_sell_amount: number;
    // Add other properties as needed
}

const ITEMS_PER_PAGE = 10;

const StocksPage: FC = () => {
    const { store } = useContext(Context);
    const [stockData, setStockData] = useState<StockItem[]>([]);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [sortBy, setSortBy] = useState<string>('sku'); // Default sorting by SKU
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    useEffect(() => {
        const fetchData = async () => {
            try {
                await store.checkAuth();
                const response = await store.stock();
                setStockData(response || []);
            } catch (error) {
                console.error('Error while fetching stock data:', error);
            }
        };

        fetchData();
    }, [store]);

    const handleSort = (field: string) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('asc');
        }
    };

    const sortedStockData = [...stockData].sort((a, b) => {
        const aValue = a[sortBy as keyof StockItem];
        const bValue = b[sortBy as keyof StockItem];
    
        if (sortOrder === 'asc') {
            return aValue > bValue ? 1 : -1;
        } else {
            return aValue < bValue ? 1 : -1;
        }
    });

    const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
    const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
    const currentItems = sortedStockData.slice(indexOfFirstItem, indexOfLastItem);

    const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

    return (
        <>
            <NavBar />
            <div className="container mt-5">
                <h2>Stock Data</h2>
                <table className="table table-bordered table-striped">
                    <thead className="thead-dark">
                        <tr>
                            <th><button  onClick={() => handleSort('sku')}>SKU</button></th>
                            <th><button  onClick={() => handleSort('warehouse_name')}>Warehouse Name</button></th>
                            <th><button  onClick={() => handleSort('item_code')}>Item Code</button></th>
                            <th><button  onClick={() => handleSort('item_name')}>Item Name</button></th>
                            <th><button  onClick={() => handleSort('free_to_sell_amount')}>FTS</button></th>
                            {/* Add other headers as needed */}
                        </tr>
                    </thead>
                    <tbody>
                        {currentItems.map((item, index) => (
                            <tr key={index}>
                                <td>{item.sku}</td>
                                <td>{item.warehouse_name}</td>
                                <td>{item.item_code}</td>
                                <td>{item.item_name}</td>
                                <td>{item.free_to_sell_amount}</td>
                                {/* Add other cells as needed */}
                            </tr>
                        ))}
                    </tbody>
                </table>
                <ul className="pagination">
                    {Array.from({ length: Math.ceil(stockData.length / ITEMS_PER_PAGE) }, (_, i) => (
                        <li key={i} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                            <button className="page-link" onClick={() => paginate(i + 1)}>
                                {i + 1}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </>
    );
};

export default observer(StocksPage);
