import React, { FC, useContext, useState } from 'react';
import { Context } from '../index';
import { observer } from 'mobx-react-lite';

const SecretForm: FC = () => {
  const [secretId, setSecretId] = useState<string>('');
  const [secretKey, setSecretKey] = useState<string>('');
  const { store } = useContext(Context);

  return (
    <div className="mt-3">
      <div className="input-group mb-3">
        <span className="input-group-text" id="clientId-addon">
          Client ID
        </span>
        <input
          type="text"
          className="form-control"
          placeholder="Введите Client ID"
          aria-label="Client ID"
          aria-describedby="clientId-addon"
          value={secretId}
          onChange={(e) => setSecretId(e.target.value)}
        />
      </div>
      <div className="input-group mb-3">
        <span className="input-group-text" id="apiKey-addon">
          API ключ
        </span>
        <input
          type="text"
          className="form-control"
          placeholder="Введите API ключ"
          aria-label="API ключ"
          aria-describedby="apiKey-addon"
          value={secretKey}
          onChange={(e) => setSecretKey(e.target.value)}
        />
      </div>
      <button type="button" className="btn btn-primary" onClick={() => store.update(secretId, secretKey)}>
        Добавить
      </button>
    </div>
  );
};

export default observer(SecretForm);
