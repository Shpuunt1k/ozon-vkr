import { IUser } from "../models/IUser";
import { makeAutoObservable } from "mobx";
import AuthService from "../services/AuthService";
import axios from 'axios';
import { AuthResponse } from "../models/response/AuthResponse";
import { API_URL } from "../http";
import UserService from "../services/UserService";
import { runInAction } from "mobx";


export default class Store {
    user = {} as IUser;
    isAuth = false;
    isLoading = false;


    constructor() {
        makeAutoObservable(this);
    }

    setAuth(bool: boolean) {
        this.isAuth = bool;
    }

    setUser(user: IUser) {
        this.user = user;
    }
    setLoading(bool: boolean) {
        this.isLoading = bool;
    }

    async stock() {
        try {
            const headers = {
                'Client-Id': this.user.secretId,
                'API-Key': this.user.secretKey,
                'Content-Type': 'application/json'
            };
            const limit = 1000
            const offset = 0
            const warehouse_type = "ALL"
            const response = await UserService.stock(limit, offset, warehouse_type, headers);
            return response?.data.result.rows
        } catch (e: any) {
            console.log(e.response?.data?.message);
        }

    }
    async total() {
        try {
            const today = new Date();
            const dateFrom = new Date(today);
            dateFrom.setDate(today.getDate() - 30);

            const formattedDateFrom = dateFrom.toISOString().slice(0, 10);

            const headers = {
                'Client-Id': this.user.secretId,
                'API-Key': this.user.secretKey,
                'Content-Type': 'application/json'
            };
            const date_from = formattedDateFrom;
            const date_to = today.toISOString().slice(0, 10);
            const metrics = ["revenue"]
            const dimension = ["day"]
            const sort = [{ key: "revenue", order: "DESC" }];
            const limit = 1000;
            const offset = 0;
            const response = await UserService.total(date_from, date_to, metrics, dimension, sort, limit, offset, headers)
            console.log(response)
            return response?.data.result.data
        } catch (e: any) {
            console.log(e.response?.data?.message);
        }
    }
    async getGeo(sku: number) {
        const headers: Record<string, string> = {
            'Client-Id': this.user.secretId,
            'API-Key': this.user.secretKey,
            'Content-Type': 'application/json'
        };
        const today = new Date();
        const dateFrom = new Date(today);
        dateFrom.setDate(today.getDate() - 60);
        const formattedDateFrom = dateFrom.toISOString();
        const dir: string = "ASC";
        const filter: {
            since: string;
            status: string;
            to: string;
        } = {
            'since': formattedDateFrom,
            'status': "",
            'to': today.toISOString()
        };
        const limit: number = 1000;
        const offset: number = 0;
        const translit: boolean = true;
        const withParam: {
            analytics_data: boolean;
            financial_data: boolean;
        } = {
            'analytics_data': false,
            'financial_data': true
        };
        const response = await UserService.getGeo(dir, filter, limit, offset, translit, withParam, headers);
        const filteredData: { [key: string]: number } = response.data.result.filter((item: any) => {
            return item.products.some((product: any) => product.sku === sku);
        }).reduce((accumulator: { [key: string]: number }, currentItem: any) => {
            const clusterTo: string = currentItem.financial_data.cluster_to;
            if (!accumulator[clusterTo]) {
                accumulator[clusterTo] = 0;
            }
            accumulator[clusterTo]++;
            return accumulator;
        }, {});

        const total: number = Object.values(filteredData).reduce((a, b) => (a as number) + (b as number), 0);
        const percentages: { [key: string]: number } = {};
        for (const [key, value] of Object.entries(filteredData)) {
            percentages[key] = Math.round((value as number / total) * 100);
        }

        // Сортировка объекта percentages по убыванию значения
        const sortedPercentages: [string, number][] = Object.entries(percentages).sort((a, b) => b[1] - a[1]);
        const sortedPercentagesObject: { [key: string]: number } = Object.fromEntries(sortedPercentages);

        //console.log(filteredData);
        console.log(sortedPercentagesObject);
        return { filteredData, percentages: sortedPercentagesObject };
    }

    async ordered(sku: any) {
        try {
            const today = new Date();
            const dateFrom = new Date(today); // Создать копию объекта today
            dateFrom.setDate(today.getDate() - 30); // Вычесть 13 дней (14 дней назад включая сегодня)

            const formattedDateFrom = dateFrom.toISOString().slice(0, 10);

            const headers = {
                'Client-Id': this.user.secretId,
                'API-Key': this.user.secretKey,
                'Content-Type': 'application/json'
            };
            const date_from = formattedDateFrom;
            const date_to = today.toISOString().slice(0, 10);
            const metrics = ["ordered_units"]
            const dimension = ["day"]
            const filters = [{ key: "sku", value: sku.toString() }];
            const sort = [{ key: "ordered_units", order: "DESC" }]
            const limit = 1000;
            const offset = 0;
            const response = await UserService.ordered(date_from, date_to, metrics, dimension, filters, sort, limit, offset, headers)
            return response?.data.result.data
        } catch (e: any) {
            console.log(e.response?.data?.message);
        }
    }
    async info(id: any) {
        try {
            const headers = {
                'Client-Id': this.user.secretId,
                'API-Key': this.user.secretKey,
                'Content-Type': 'application/json'
            };
            const offer_id = ""
            const product_id = id
            const sku = 0
            const response = await UserService.info(offer_id, product_id, sku, headers)
            return response.data.result
        } catch (e: any) {
            console.log(e.response?.data?.message);
        }
    }
    async desc(id: any) {
        try {
            const headers = {
                'Client-Id': this.user.secretId,
                'API-Key': this.user.secretKey,
                'Content-Type': 'application/json'
            };
            const offer_id = ""
            const product_id = id
            const response = await UserService.desc(offer_id, product_id, headers)
            return response.data.result
        } catch (e: any) {
            console.log(e.response?.data?.message);
        }
    }
    async keys(id: any) {
        try {
            const headers = {
                'Client-Id': this.user.secretId,
                'API-Key': this.user.secretKey,
                'Content-Type': 'application/json'
            };
            const filter = {
                product_id: [id]
            };
            const limit = 100;
            const last_id = "";
            const sort_dir = "ASC";
            const response = await UserService.keys(filter, limit, last_id, sort_dir, headers);
            return response.data.result[0].attributes[7].values[0].value;
        } catch (e: any) {
            console.log(e.response?.data?.message);
        }
    }
    async list() {
        try {
            const headers = {
                'Client-Id': this.user.secretId,
                'API-Key': this.user.secretKey,
                'Content-Type': 'application/json'
            };
            const limit = 100;
            const filter = {}
            const response = await UserService.list(filter, limit, headers)
            return response?.data.result.items
        } catch (e: any) {
            console.log(e.response?.data?.message);
        }
    }
    async aiDesc(name: any, options: any) {
        try {
            const response = await UserService.aiDesc(name, options)
            console.log(response)
            return response.data.message
        } catch (e: any) {
            console.log(e.response?.data?.message);
        }
    }
    async aiReview(stocks: any, orders: any, supply: any) {
        try {
            const response = await UserService.aiReview(stocks, orders, supply)
            console.log(response)
            return response.data.message
        } catch (e: any) {
            console.log(e.response?.data?.message);
        }
    }
    async login(email: string, password: string) {
        try {
            const response = await AuthService.login(email, password);
            console.log(response)
            localStorage.setItem('token', response.data.accessToken);
            this.setAuth(true);
            this.setUser(response.data.user);
        } catch (e: any) {
            console.log(e.response?.data?.message);
        }
    }
    async registration(email: string, password: string) {
        try {
            const response = await AuthService.registration(email, password);
            console.log(response)
            localStorage.setItem('token', response.data.accessToken);
            this.setAuth(true);
            this.setUser(response.data.user);
        } catch (e: any) {
            console.log(e.response?.data?.message);
        }
    }

    async logout() {
        try {
            const response = await AuthService.logout();
            localStorage.removeItem('token');
            this.setAuth(false);
            this.setUser({} as IUser);
        } catch (e: any) {
            console.log(e.response?.data?.message);
        }
    }
    async checkAuth() {
        this.setLoading(true);
        try {
            const response = await axios.get<AuthResponse>(`${API_URL}/refresh`, { withCredentials: true })
            console.log(response);
            localStorage.setItem('token', response.data.accessToken);
            this.setAuth(true);
            this.setUser(response.data.user);
        } catch (e: any) {
            console.log(e.response?.data?.message);
        } finally {
            this.setLoading(false);
        }
    }
    async update(secretId: string, secretKey: string) {
        try {
            const userId = this.user.id
            const response = await UserService.update(userId, secretId, secretKey)
            console.log(response)
            runInAction(() => {
                this.user.secretId = secretId;
                this.user.secretKey = secretKey;
            });
        } catch (e: any) {
            console.log(e.response?.data?.message);
        }
    }

}


// {"date_from":"2024-03-06",
// "date_to":"2024-03-19",
// "metrics":[
//     "ordered_units"
// ],
// "dimension":[
//     "day"
// ],
// "filters":[{
//     "key":"sku",
//     "value":"963000603"
// }],
// "limit":1000,
// "offset":0}

