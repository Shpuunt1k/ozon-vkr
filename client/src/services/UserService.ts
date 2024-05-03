import { $api } from '../http';
import { $ozon } from '../http';
import { AxiosResponse } from 'axios';
import { AuthResponse } from '../models/response/AuthResponse';
import { IUser } from '../models/IUser';
import { IncomingHttpHeaders } from 'http';

type HttpHeaders = Record<string, string>;

export default class UserService {

  static fetchUsers(): Promise<AxiosResponse<IUser[]>> {
    return $api.get<IUser[]>('/users');
  }

  static async update(userId: any, secretId: string, secretKey: string): Promise<AxiosResponse<IUser>> {
    return $api.post<IUser>('/update', { userId, secretId, secretKey });
  }

  static async stock(limit: any, offset: any, warehouse_type: string, headers: HttpHeaders): Promise<AxiosResponse<any>> {
    const data = { limit, offset, warehouse_type };
    return $ozon.post<any>('/v2/analytics/stock_on_warehouses', data, { headers });
  }
  static async total(date_from: string, date_to: string, metrics: string[], dimension: string[], sort: any[], limit: any, offset: any, headers: HttpHeaders): Promise<AxiosResponse<any>> {
    const data = { date_from, date_to, metrics, dimension, sort, limit, offset};
    return $ozon.post<any>('/v1/analytics/data', data, { headers });
  }
  static async list(filter: any, limit: any, headers: HttpHeaders): Promise<AxiosResponse<any>> {
    const data = {filter, limit}
    return $ozon.post<any>('/v3/product/info/stocks', data, { headers });
  }
  static async info(offer_id: any, product_id: any, sku: any, headers: HttpHeaders): Promise<AxiosResponse<any>> {
    const data = { offer_id, product_id, sku};
    return $ozon.post<any>('/v2/product/info', data, { headers });
  }
  static async ordered(date_from: string, date_to: string, metrics: string[], dimension: string[], filters: any[], sort: any[], limit: any, offset: any, headers: HttpHeaders): Promise<AxiosResponse<any>> {
    const data = { date_from, date_to, metrics, dimension, filters, sort, limit, offset};
    return $ozon.post<any>('/v1/analytics/data', data, { headers });
  }
  static async desc(offer_id: any, product_id: any, headers: HttpHeaders): Promise<AxiosResponse<any>> {
    const data = { offer_id, product_id};
    return $ozon.post<any>('/v1/product/info/description', data, { headers });
  }
  static async aiDesc(name: any, options: any): Promise<AxiosResponse<any>> {
    return $api.post<any>('/answer',{ name, options});
  }
  static async aiReview(stocks: any, orders: any, supply: any): Promise<AxiosResponse<any>> {
    return $api.post<any>('/review',{ stocks, orders, supply});
  }
  static async getGeo(dir: string, filter: any, limit: any, offset: any, translit: any, withParam: any, headers: HttpHeaders): Promise<AxiosResponse<any>> {
    const data = { dir, filter, limit, offset, translit, with: withParam };
    return $ozon.post<any>('/v2/posting/fbo/list', data, { headers });
  }
  static async keys(filter: any, limit: any, last_id: any, sort_dir: any, headers: HttpHeaders): Promise<AxiosResponse<any>> {
    const data = { filter, limit, last_id, sort_dir};
    return $ozon.post<any>('/v3/products/info/attributes', data, { headers });
  }
}


//2740c57f-48a8-43d9-bc8c-0eced52360c4

