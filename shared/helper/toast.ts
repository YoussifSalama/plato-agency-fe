import { toast } from "react-toastify"

export const successToast = (message: string) => {
    toast.success(message);
};

export const errorToast = (message: string) => {
    toast.error(message);
};

export const warningToast = (message: string) => {
    toast.warning(message);
};

export const infoToast = (message: string) => {
    toast.info(message);
};