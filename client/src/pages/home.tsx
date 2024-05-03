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

const HomePage: FC = () => {
  const { store } = useContext(Context);
  const [users, setUsers] = useState<IUser[]>([]);
  const [totalData, setTotalData] = useState<any[]>([]);
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [totalMetricsSum, setTotalMetricsSum] = useState<number | undefined>(undefined); // Объявление totalMetricsSum

  useEffect(() => {
    if (localStorage.getItem('token')) {
      store.checkAuth();
    }
  }, []);

  useEffect(() => {
    if (store.isAuth) {
      getTotal();
    }
  }, [store.isAuth]);

  async function getTotal() {
    try {
      const response: { dimensions: any[]; metrics: number[] }[] = await store.total();
      setTotalData(response);

      const sum = response.reduce((total, item) => {
        return total + item.metrics[0];
      }, 0);

      setTotalMetricsSum(sum);

      drawChart(response);
    } catch (e) {
      console.log(e);
    }
  }



  const drawChart = (data: any[]) => {
    if (!chartRef.current || !data) return;

    const labels = data.map(item => item.dimensions[0].id);
    const values = data.map(item => item.metrics[0]);

    new Chart(chartRef.current, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Сумма',
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
              display: false // Убираем вертикальную сетку
            }
          },
          y: {
            beginAtZero: true
          }
        },
        plugins: {
          tooltip: {
            callbacks: {
              title: () => '', // Пустой заголовок
              //afterLabel: (tooltipItem: any) => `Сумма: ${tooltipItem.parsed.y.toFixed(2)}` // Отображение только суммы после заголовка
            }
          }
        },
        elements: {
          line: {
            borderWidth: 3 // Установка ширины линии графика
          }
        },
        layout: {
          padding: {
            left: 20, // Установка отступа слева для графика
            right: 20 // Установка отступа справа для графика
          }
        }
      }
    });
  };


  const handleEditButtonClick = () => {
    setIsEditing(!isEditing);
  };

  if (store.isLoading) {
    return <div className="container">Загрузка...</div>;
  }

  if (!store.isAuth) {
    return (
      <div className="container">
        <LoginForm />
      </div>
    );
  }

  return (
    <>
      <NavBar />
      <div className="container mt-5">
        <div className="card text-center">
          <div className="card-header">
            {store.isAuth ? `Пользователь авторизован: ${store.user.email}` : 'АВТОРИЗУЙТЕСЬ'}
          </div>
          <div className="card-body">
            <h5 className="card-title">{store.user.isActivated ? 'Аккаунт подтвержден по почте' : 'ПОДТВЕРДИТЕ АККАУНТ!!!!'}</h5>
            <p className="card-text">{store.user.secretId && store.user.secretKey ? `Id: ${store.user.secretId} Key: ${store.user.secretKey}` : `Нет данных`}</p>
            {isEditing ? (
              <SecretForm />
            ) : (
              <button type="button" className="btn btn-primary mt-3" onClick={handleEditButtonClick}>
                Изменить
              </button>
            )}
            <button type="button" className="btn btn-danger mt-3" onClick={() => store.logout()}>
              Выйти
            </button>
          </div>
          <div className="card-footer text-muted">
            <canvas ref={chartRef} width={800} height={400}></canvas>
          </div>
        </div>
        <div className="row">
          <div className="col-md-12">
            <div className="card mb-3">
              <div className="card-body">
                {totalMetricsSum !== undefined && ( // Проверка, что totalMetricsSum определено
                  <>
                    <h2>Заказано на сумму: {totalMetricsSum} руб.</h2>
                    за последние 30 дней
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default observer(HomePage);
