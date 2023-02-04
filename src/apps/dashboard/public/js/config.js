export default await fetch("/config.json").then((response) => response.json());
