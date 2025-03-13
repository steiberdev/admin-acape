class serverConnect {
  constructor(user, password, url){
    this.user = user;
    this.password = password;
    this.api = !axios?null:axios.create({
        baseURL: "https://amazing-morally-yak.ngrok-free.app",
        headers: {
          "ngrok-skip-browser-warning": "true"
        }
    });
    this.serverConnect = false;
  }

  async connect(){
    if(!this.api) return {message: "Parece que la API de axios no se encuentra listada o bien conectada. Solicita tu error con tu desarrollador"};

    return this.api.get('/alldata').then((data) => {
      this.serverConnect = true;

      return data.data;
    }).catch(() => this.defaultErrorResponse())
  }

  async login(user, password){
    if(!this.serverConnect) return {message: "Parece que el servicio no esta conectado, ejecuta .connect() o revisa tu conexion", error: true};

    return this.api.post('/login-acape', {user, password}).then((data) => {
      return data.data;
    }).catch(() => this.defaultErrorResponse())
  }

  async token(token){
    if(!this.serverConnect) this.connectionErrorResponse();


    return this.api.post('/session-validator', {token: token}).then((data) => {
      return data.data;
    }).catch((err) => {
      return this.defaultErrorResponse();
    })
  }

  accounting(token){
    if(!this.serverConnect) this.connectionErrorResponse();

    return this.api.post('/api/accounting', {token: token}).then((data) => {
      return data.data;
    }).catch(() => this.defaultErrorResponse())
  }

  cajas(token){
    if(!this.serverConnect) this.connectionErrorResponse();

    return this.api.post('/api/cajas', {token: token}).then((data) => {
      return data.data;
    }).catch(() => this.defaultErrorResponse())
  }

  production(token){
    if(!this.serverConnect) this.connectionErrorResponse();

    return this.api.post('/api/production', {token: token}).then((data) => {
      return data.data;
    }).catch(() => this.defaultErrorResponse())
  }

  downloadAllData(token){
    if(!this.serverConnect) this.connectionErrorResponse();


    return this.api.post('/api/alldata', {token: token}).then((data) => {
      return data.data;
    }).catch(() => this.defaultErrorResponse());
  }




  // RESPONSES DEFAULTS --------------------------------------------------
  defaultErrorResponse() {
    return { message: "Desconexion o error del servidor principal", error: true };
  }

  connectionErrorResponse() {
    return { message: "Parece que el servicio no está conectado, ejecuta .connect() o revisa tu conexión.", error: true };
  }
}
