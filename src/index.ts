import fetch from "node-fetch";
import qs from "qs";
import { mutateBooleans, sleep } from "./utils";

interface OrderNumberOptions {
  service: string;
  country: number;
  ref: number;
  forward?: boolean;
  phoneException?: boolean;
  operator?: string;
}

const getBaseUrl = (apiKey: string) =>
  "https://sms-activate.ru/stubs/handler_api.php?api_key=" + apiKey;

interface OrderResponse {
  id: string;
  number: string;
}

const orderNumber = async (
  apiKey: string,
  options: OrderNumberOptions
): Promise<OrderResponse> => {
  mutateBooleans(options);
  return fetch(`${getBaseUrl(apiKey)}&action=getNumber&${qs.stringify(options)}`)
    .then(res => res.text())
    .then(res => {
      if (!res.startsWith("ACCESS_NUMBER")) throw res;
      const [, id, number] = res.split(":");
      return { id, number };
    })
    .catch(error => {
      throw new Error("Error ordering number: " + error);
    });
};

const waitForCode = async (
  apiKey: string,
  id: string,
  interval = 2000
): Promise<string> => {
  const status = await fetch(`${getBaseUrl(apiKey)}&action=getStatus&id=${id}`)
    .then(res => res.text())
    .catch(_ => null);

  if (!status || /WAIT/.test(status)) {
    await sleep(2000);
    return waitForCode(apiKey, id, interval);
  }

  if (!status.startsWith("STATUS_OK"))
    throw new Error("Error waiting for code: " + status);

  return status.split(":")[1];
};

const SMSClient = (apiKey: string) => {
  return {
    orderNumber: orderNumber.bind(null, apiKey),
    waitForCode: waitForCode.bind(null, apiKey),
  };
};

export default SMSClient;
