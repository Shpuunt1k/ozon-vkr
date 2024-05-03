import 'bootstrap/dist/css/bootstrap.min.css';
import React, { FC, useContext, useState } from 'react';
import { Context } from '../index';
import { observer } from 'mobx-react-lite';

const LoginForm: FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const { store } = useContext(Context);

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title text-center">Вход в систему</h5>
              <form>
                <div className="form-group mb-3">
                  <label>Email:</label>
                  <input
                    onChange={(e) => setEmail(e.target.value)}
                    value={email}
                    type="text"
                    className="form-control"
                    placeholder="Введите ваш email"
                  />
                </div>
                <div className="form-group mb-3">
                  <label>Пароль:</label>
                  <input
                    onChange={(e) => setPassword(e.target.value)}
                    value={password}
                    type="password"
                    className="form-control"
                    placeholder="Введите ваш пароль"
                  />
                </div>
                <div className="form-group text-center">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => store.login(email, password)}
                  >
                    Войти
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary ms-2"
                    onClick={() => store.registration(email, password)}
                  >
                    Регистрация
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default observer(LoginForm);
