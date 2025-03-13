const acape = new serverConnect();

const alert = Swal.mixin({
  customClass: {
    popup: 'shadow',
    confirmButton: 'btn btn-outline-primary',
    cancelButton: 'btn btn-outline-danger'
  },
  confirmButtonText: "Aceptar",
  cancelButtonText: "Cancelar",
  buttonsStyling: false,
  showClass: {
    popup: '' // Desactivar animación de entrada
  },
  hideClass: {
    popup: '' // Desactivar animación de salida
  },
  inputAttributes: {
    class: "numberify-input-commas",
    type: "text"
  }
});

const loadingToast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  allowOutsideClick: false,
  allowEscapeKey: false,
  allowEnterKey: false,
  timerProgressBar: true,
  timer: 4000
});

function formatNumber(number) {
  // Limita a dos decimales
  const formattedNumber = Number(number).toFixed(2);

  // Aplica el formateo con comas
  return formattedNumber.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}


acape.serverConnect = true;

let validatorSession = localStorage.getItem('acape-token-session');

const server_validator = async () => {
  let validating = await acape.token(validatorSession);

  if (!validating.data) {
    let chargingData = localStorage.getItem('acape/accounting');

    if (!chargingData) {
      location.replace('./login.html')
    } else {
      let finalData = {
        data: {
          accounting: JSON.parse(chargingData)
        }
      };

      document.querySelector('.final-money-global').innerHTML = `$ ${formatNumber(finalData.data.accounting.value)}`;

      let carteras = converterArray(finalData.data.accounting.carteras);

      document.querySelector('.base-carteras').innerHTML += carteras.map(ch => `
        <div class="col-md-6 col-12">
          <div class="card">
            <div class="card-header mx-4 p-3 text-center">
              <div class="icon icon-shape icon-lg bg-gradient-dark shadow text-center border-radius-lg">
                <i class="material-symbols-rounded opacity-10">PAID</i>
              </div>
            </div>
            <div class="card-body pt-0 p-3 text-center">
              <h6 class="text-center mb-0">${ch.name?ch.name:"Cartera Nueva Creada"}</h6>
              <span class="text-xs">${ch.desc?ch.desc:"Cartera Añadida Por El Sistema"}</span>
              <hr class="horizontal dark my-3">
              <h5 class="mb-0 final-money-global">$ ${formatNumber(ch.value)}</h5>
            </div>
          </div>
        </div>
      `);

      let finalMovements = converterArray(finalData.data.accounting.movements).reverse();



      document.querySelector('.movements-acape').innerHTML = finalMovements.map(ch => {

        if (ch.sign == "-") {
          return `
            <li class="list-group-item border-0 d-flex justify-content-between ps-0 mb-2 border-radius-lg">
              <div class="d-flex align-items-center">
                <button class="btn btn-icon-only btn-rounded btn-outline-danger mb-0 me-3 p-3 btn-sm d-flex align-items-center justify-content-center"><i class="material-symbols-rounded text-lg">expand_more</i></button>
                <div class="d-flex flex-column">
                  <h6 class="mb-1 text-dark text-sm">${ch.type}</h6>
                  <span class="text-xs">${new Date(ch.date)}</span>
                </div>
              </div>
              <div class="d-flex align-items-center text-danger text-gradient text-sm font-weight-bold">
                $ ${formatNumber(ch.money)}
              </div>
            </li>
          `
        } else {
          return `
            <li class="list-group-item border-0 d-flex justify-content-between ps-0 mb-2 border-radius-lg">
                <div class="d-flex align-items-center">
                  <button class="btn btn-icon-only btn-rounded btn-outline-success mb-0 me-3 p-3 btn-sm d-flex align-items-center justify-content-center"><i class="material-symbols-rounded text-lg">expand_less</i></button>
                  <div class="d-flex flex-column">
                    <h6 class="mb-1 text-dark text-sm">${ch.type}</h6>
                    <span class="text-xs">${new Date(ch.date)}</span>
                  </div>
                </div>
                <div class="d-flex align-items-center text-success text-gradient text-sm font-weight-bold">
                  $ ${formatNumber(ch.money)}
                </div>
              </li>
          `;
        }
      }).join('');


    }
  }
}

function converterArray(object) {
  let keys = Object.keys(object);
  let arrayToReturn = [];

  keys.forEach((element, i, array) => {
    arrayToReturn.push(object[element]);
  })

  return arrayToReturn;
}

function formatearFecha(fecha) {
  const opcionesFecha = { day: 'numeric', month: 'short', year: 'numeric' };
  const opcionesHora = { hour: 'numeric', minute: 'numeric', hour12: true };

  let fechaFormateada = fecha.toLocaleDateString('es-ES', opcionesFecha);
  let horaFormateada = fecha.toLocaleTimeString('es-ES', opcionesHora);

  // Formatear "p. m." o "a. m." en mayúsculas
  horaFormateada = horaFormateada.replace(' a. m.', ' AM').replace(' p. m.', ' PM');

  return `${fechaFormateada}, a las ${horaFormateada}`;
}

async function downloadAllData() {
  let finalData = await acape.downloadAllData(validatorSession);

  if (!finalData.data && !localStorage.getItem('acape/accounting')) return alert.fire({
    title: "Error de server",
    text: finalData.message,
    icon: "error"
  });

  let finalMoneyGlobal_money = document.querySelector('.final-money-global');

  localStorage.setItem('acape/cajas', JSON.stringify(finalData.data.cajas))
  localStorage.setItem('acape/accounting', JSON.stringify(finalData.data.accounting))
  localStorage.setItem('acape/production', JSON.stringify(finalData.data.production))

  finalMoneyGlobal_money.innerHTML = `$ ${formatNumber(finalData.data.accounting.value)}`;

  let carteras = converterArray(finalData.data.accounting.carteras);

  setTimeout(() => {
    loadingToast.close()

    loadingToast.fire({
      icon: "success",
      text: "Información descargada satisfactoriamente"
    })
  }, 3000);


  document.querySelector('.base-carteras').innerHTML += carteras.map(ch => `
    <div class="col-md-6 col-12">
      <div class="card">
        <div class="card-header mx-4 p-3 text-center">
          <div class="icon icon-shape icon-lg bg-gradient-dark shadow text-center border-radius-lg">
            <i class="material-symbols-rounded opacity-10">PAID</i>
          </div>
        </div>
        <div class="card-body pt-0 p-3 text-center">
          <h6 class="text-center mb-0">${ch.name?ch.name:"Cartera Nueva Creada"}</h6>
          <span class="text-xs">${ch.desc?ch.desc:"Cartera Añadida Por El Sistema"}</span>
          <hr class="horizontal dark my-3">
          <h5 class="mb-0 final-money-global">$ ${formatNumber(ch.value)}</h5>
        </div>
      </div>
    </div>
  `);

  let finalMovements = converterArray(finalData.data.accounting.movements).reverse();

  document.querySelector('.movements-acape').innerHTML = finalMovements.map(ch => {

    if (ch.sign == "-") {
      return `
        <li class="list-group-item border-0 d-flex justify-content-between ps-0 mb-2 border-radius-lg">
          <div class="d-flex align-items-center">
            <button class="btn btn-icon-only btn-rounded btn-outline-danger mb-0 me-3 p-3 btn-sm d-flex align-items-center justify-content-center"><i class="material-symbols-rounded text-lg">expand_more</i></button>
            <div class="d-flex flex-column">
              <h6 class="mb-1 text-dark text-sm">${ch.type}</h6>
              <span class="text-xs">${new Date(ch.date)}</span>
            </div>
          </div>
          <div class="d-flex align-items-center text-danger text-gradient text-sm font-weight-bold">
            $ ${formatNumber(ch.money)}
          </div>
        </li>
      `
    } else {
      return `
        <li class="list-group-item border-0 d-flex justify-content-between ps-0 mb-2 border-radius-lg">
            <div class="d-flex align-items-center">
              <button class="btn btn-icon-only btn-rounded btn-outline-success mb-0 me-3 p-3 btn-sm d-flex align-items-center justify-content-center"><i class="material-symbols-rounded text-lg">expand_less</i></button>
              <div class="d-flex flex-column">
                <h6 class="mb-1 text-dark text-sm">${ch.type}</h6>
                <span class="text-xs">${new Date(ch.date)}</span>
              </div>
            </div>
            <div class="d-flex align-items-center text-success text-gradient text-sm font-weight-bold">
              $ ${formatNumber(ch.money)}
            </div>
          </li>
      `;
    }
  }).join('');
}

if (!validatorSession) {
  const nameset = document.querySelector('body').getAttribute('nameset');

  if (nameset != "login") {
    location.replace('./login.html')
  }

} else {
  server_validator();
}


// LOGIN AND REGISTER FORM

const simplified = document.querySelector('.form-login-acape');

if (simplified) {
  simplified.addEventListener('submit', async (e) => {
    e.preventDefault();

    const dataUser = {
      user: e.target[0].value,
      password: e.target[1].value
    }

    let finalLogin = await acape.login(dataUser.user, dataUser.password);

    if (!finalLogin.data) {
      alert.fire({
        title: "Error de sesion",
        text: finalLogin.message,
        icon: "error"
      })
    } else {
      localStorage.setItem('acape-token-session', finalLogin.data.token);

      location.replace('./index.html')
    }


  })
}


// FINAL ------- LOGIN AND REGISTER



// INDEX PAGES


const bodyNameset = document.querySelector('body').getAttribute('nameset');

if (bodyNameset == "index") {
  downloadAllData().catch((err) => {
    setTimeout(() => {
      loadingToast.close();

      loadingToast.fire({
        icon: "error",
        title: "Error al descargar",
        text: "probablemente no tenga internet o el servidor este caido"
      })
    }, 4000)
  })

  loadingToast.fire({
    icon: 'info',
    title: 'Descargando información...',
    text: 'Se esta descargando la información actualizada del servidor.',
    timerProgressBar: true,
    didOpen: () => {
      Swal.showLoading();
    }
  })
}

if(bodyNameset == "produccion"){
  let finalProduction = converterArray(JSON.parse(localStorage.getItem('acape/production')));
  finalProduction.sort((a, b) => new Date(b) - new Date(a)).reverse();


  document.querySelector('.final-production').innerHTML = finalProduction.map(ch => {

    return `
    <li class="list-group-item border-0 d-flex p-4 mb-2 bg-gray-100 border-radius-lg">
              <div class="d-flex flex-column">
                <h6 class="mb-3">${formatearFecha(ch.date)}</h6>
                <span class="mb-2">Gastos Indirectos: <span class="text-danger font-weight-bold ms-sm-2">$ ${formatNumber(ch.data.finalPrice.totallyIndirectos)}</span></span>
                <span class="mb-2">Gastos Materia Prima: <span class="text-danger font-weight-bold ms-sm-2">$ ${formatNumber(ch.data.finalPrice.costo)}</span></span>
                <span class="mb-2">Total En Venta: <span class="text-success ms-sm-2 font-weight-bold">$ ${formatNumber(ch.data.finalPrice.ingreso)}</span></span>
                <span class="mb-2 text-dark font-weight-bold text-success">Total NETO: <span class="text-dark ms-sm-2 font-weight-bold">$ ${formatNumber(ch.data.finalPrice.ingreso - ch.data.finalPrice.totallyIndirectos - ch.data.finalPrice.costo)}</span></span>
              </div>
            </li>
  `;
  });
}

if(bodyNameset == "bills"){
  let finalProduction = converterArray(JSON.parse(localStorage.getItem('acape/accounting')).movements).reverse();

  document.querySelector('.movements-acape').innerHTML = finalProduction.map(ch => {

    if (ch.sign == "-") {
      return `
        <li class="list-group-item border-0 d-flex justify-content-between ps-0 mb-2 border-radius-lg">
          <div class="d-flex align-items-center">
            <button class="btn btn-icon-only btn-rounded btn-outline-danger mb-0 me-3 p-3 btn-sm d-flex align-items-center justify-content-center"><i class="material-symbols-rounded text-lg">expand_more</i></button>
            <div class="d-flex flex-column">
              <h6 class="mb-1 text-dark text-sm">${ch.type}</h6>
              <span class="text-xs">${new Date(ch.date)}</span>
            </div>
          </div>
          <div class="d-flex align-items-center text-danger text-gradient text-sm font-weight-bold">
            $ ${formatNumber(ch.money)}
          </div>
        </li>
      `
    } else {
      return `
        <li class="list-group-item border-0 d-flex justify-content-between ps-0 mb-2 border-radius-lg">
            <div class="d-flex align-items-center">
              <button class="btn btn-icon-only btn-rounded btn-outline-success mb-0 me-3 p-3 btn-sm d-flex align-items-center justify-content-center"><i class="material-symbols-rounded text-lg">expand_less</i></button>
              <div class="d-flex flex-column">
                <h6 class="mb-1 text-dark text-sm">${ch.type}</h6>
                <span class="text-xs">${new Date(ch.date)}</span>
              </div>
            </div>
            <div class="d-flex align-items-center text-success text-gradient text-sm font-weight-bold">
              $ ${formatNumber(ch.money)}
            </div>
          </li>
      `;
    }
  }).join('');
}

function organizarPorDia(datos) {
    const agrupados = {};

    datos.forEach(item => {
        // Convertir timestamp a fecha en formato YYYY-MM-DD (sin hora)
        const fechaObj = new Date(item.cerrada);
        const fechaClave = fechaObj.toISOString().split('T')[0]; // Clave basada en la fecha

        if (!agrupados[fechaClave]) {
            agrupados[fechaClave] = {
                cerrada: fechaClave,
                total_recibido: 0,
                value: 0,
                egreso: 0,
                value_egresos: 0,
                data: []
            };
        }

        // Sumar los valores al objeto del día correspondiente
        agrupados[fechaClave].total_recibido += item.total_recibido || 0;
        agrupados[fechaClave].value += item.value || 0;
        agrupados[fechaClave].egreso += item.egreso?item.egreso:0;
        agrupados[fechaClave].value_egresos += item.value_egresos || 0;

        // Agregar la entrada individual
        agrupados[fechaClave].data.push(item);
    });

    return Object.values(agrupados);
}



function formatearFecha(fechaStr) {
    const fecha = new Date(fechaStr);
    if (isNaN(fecha)) return "Fecha inválida"; // Manejo de errores

    const diasSemana = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
    const meses = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"];

    const diaSemana = diasSemana[fecha.getDay()];
    const dia = fecha.getDate();
    const mes = meses[fecha.getMonth()];
    const año = fecha.getFullYear();

    return `${diaSemana} - ${dia} ${mes} ${año}`;
}


let finalCajas_log = document.querySelector('.list-cajas');

if (finalCajas_log) {
  let finalCajas = localStorage.getItem('acape/cajas');

  if (!finalCajas) alert.fire({
    title: "Error de conexion",
    text: "No hay ninguna información descargada",
    icon: "error"
  });

  // finals

  let finalDataToHTML = converterArray(JSON.parse(finalCajas)).reverse();

  let simpleCaja = organizarPorDia(finalDataToHTML);


  finalCajas_log.innerHTML = simpleCaja.map(ch => {

    return `<div class="card mt-2">
            <div class="card-header pb-0 px-3">
              <h6 class="mb-0">${formatearFecha(ch.cerrada)}</h6>
              <p class="mb-0 text-dark font-weight-bold">Total recibido: $${formatNumber(ch.total_recibido)}</p>
              <p class="mb-0 text-dark font-weight-bold">Total Gastos: $${formatNumber(ch.egreso + ch.value_egresos)}</p>
              <p class="mb-0 text-dark font-weight-bold">Total Entregado: $${formatNumber(ch.value)}</p>
            </div>
            <div class="card-body pt-4 p-3">
              <ul class="list-group">

                ${ch.data.map(item => {

                  return `

                  <li class="list-group-item border-0 d-flex p-4 mb-2 mt-3 bg-gray-100 border-radius-lg">
                    <div class="d-flex flex-column">
                      <h6 class="mb-3 text-sm">Cerrada por ${item.closedByName}</h6>
                      <span class="mb-2 text-xs">Total recibido: <span class="text-dark font-weight-bold ms-sm-2">$ ${formatNumber(item.total_recibido)}</span></span>
                      <span class="mb-2 text-xs">Total Gastos: <span class="text-dark ms-sm-2 font-weight-bold">$ ${formatNumber(item.egreso?item.egreso:0 + item.value_egresos?item.value_egresos:0)}</span></span>
                      <span class="text-xs">Total Entregado: <span class="text-dark ms-sm-2 font-weight-bold"> $ ${formatNumber(item.value - item.starting)}</span></span>
                    </div>
                    <div class="ms-auto text-end">
                      <a class="btn btn-link text-danger text-gradient px-3 mb-0" href="javascript:;"><i class="material-symbols-rounded text-sm me-2">delete</i>Delete</a>
                      <a class="btn btn-link text-dark px-3 mb-0" href="javascript:;"><i class="material-symbols-rounded text-sm me-2">edit</i>Edit</a>
                    </div>
                  </li>

                `}).join('')}

              </ul>
            </div>
          </div>`;

  }).join('');
}
