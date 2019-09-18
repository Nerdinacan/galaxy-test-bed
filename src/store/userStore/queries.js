import axios from "axios";


export async function getCurrentUser() {
    const url = "/api/users/current";
    const response = await axios.get(url);
    if (response.status != 200) {
        throw new Error(response);
    }
    return response.data;
}
