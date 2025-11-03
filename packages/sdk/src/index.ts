import axios, { AxiosInstance } from 'axios';

interface SDKOptions {
  baseURL: string;
  getAccessToken?: () => string | null;
}

export class DigitalYagodaSDK {
  private readonly client: AxiosInstance;

  constructor({ baseURL, getAccessToken }: SDKOptions) {
    this.client = axios.create({ baseURL });
    this.client.interceptors.request.use((config) => {
      if (getAccessToken) {
        const token = getAccessToken();
        if (token) {
          config.headers = config.headers ?? {};
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
      return config;
    });
  }

  async getCompanies() {
    const { data } = await this.client.get('/companies');
    return data;
  }
}
