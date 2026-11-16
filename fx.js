const params = new URLSearchParams(window.location.search);
const id = params.get("id");

const files = {
    "Loading...": "https://lol.directtvhub.shop/loading.html",
    "Video2": "https://lol.directtvhub.shop/video2.html"
};

if (id && files[id]) {
    window.location.replace(files[id]);
}
