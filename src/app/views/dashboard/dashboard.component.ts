import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { NgxSpinnerService } from "ngx-spinner";
import { PrecioPisoDAOService } from 'src/app/services/DAO/precio-piso-dao.service';
import { getDatosI } from 'src/app/models/getDatos.interface';
import Swal from 'sweetalert2'

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  // COSTO PRECIO PISO
  preciopisoGral: any = 0;
  utilidadPrecioPiso: any = 0;

  // COSTO PRECIO PROPUESTO
  pppreciopisoGral: any = 0;

  // UTILIDAD OPERATIVA NETA (GRAFICA)
  utilidadNeta: string = '-';
  pputilidadOperativaNeta: any = 0;

  //DIFERENCIA UTILIDAD
  difPrePropuestoVSPrePiso: any = 0;


  //GAUGE CHART
  angulo: any = 90;
  chartPrecioPropuesto: any = 0;
  chartPrecioPiso: any = 0;
  chartCostoVenta: any = 0;
  chartGastoCryogenico: any = 0;
  chartGastosVenta: any = 0;

  // SELECT FILTER
  linea: any[] = [];
  zona: any[] = [];
  codigo: any[] = [];

  //DIFERENCIA PARTE INFERIOR
  costoVariable: string = '-';

  //NG MODEL
  selectedCodigoSpan: string = '';
  selectedDescripcionSpan: string = '';
  selectedUMSpan: string = '';
  child: boolean = false;

  //FORM
  filterForm = new FormGroup({
    linea: new FormControl('', Validators.required),
    codigo: new FormControl('', Validators.required),
    zona: new FormControl('', Validators.required),
    propuesto: new FormControl(''),
    volumen: new FormControl('', Validators.required),
    tipoOperacion: new FormControl(false, Validators.nullValidator),
  })

  mymodel:any;
  constructor(private precioPiso: PrecioPisoDAOService, private spinner: NgxSpinnerService) { }

  ngOnInit(): void {
    this.selectLinea();
    this.selectZona();
  }

  validaVacios() {
    (document.getElementById('simulacion') as HTMLButtonElement).disabled = true;

    var linea = (document.getElementById("linea") as HTMLInputElement).value.length;
    var codigo = (document.getElementById("codigo") as HTMLInputElement).value.length;
    var volumen = (document.getElementById("volumen") as HTMLInputElement).value.length;
    var zona = (document.getElementById("zona") as HTMLInputElement).value.length;

    if (linea != 0 && codigo != 0 && volumen != 0 && zona != 0) {
      (document.getElementById('simulacion') as HTMLButtonElement).disabled = false;
    } else {
      (document.getElementById('simulacion') as HTMLButtonElement).disabled = true;
    }
  }

  selectLinea() {
    this.precioPiso.getLinea().subscribe(res => {
      this.linea = res;
    });
    (document.getElementById("linea") as HTMLInputElement).value = "";
    (document.getElementById("codigo") as HTMLInputElement).value = "";
    (document.getElementById("volumen") as HTMLInputElement).value = "";
    (document.getElementById("zona") as HTMLInputElement).value = "";
    this.validaVacios();
  }

  selectCodigo(event: any) {
    let value = event.target.value;
    (document.getElementById("codigo") as HTMLSelectElement).disabled = true;
    (document.getElementById("codigo") as HTMLSelectElement).style.backgroundColor = "#c0c0c0";
    this.precioPiso.getCodigo(value).subscribe(res => {
      this.codigo = res;
      (document.getElementById("codigo") as HTMLSelectElement).disabled = false;
      (document.getElementById("codigo") as HTMLSelectElement).style.backgroundColor = "#F2F2F2";
    });

    //Limpiar campos 
    (document.getElementById("codigo") as HTMLInputElement).value = "";
    (document.getElementById("zona") as HTMLInputElement).value = "";
    (document.getElementById("precioPropuesto") as HTMLInputElement).value = "";
    (document.getElementById("volumen") as HTMLInputElement).value = "";
    (document.getElementById('cryoinfra') as HTMLInputElement).checked = false;

    (document.getElementById('utilidadNetaText') as HTMLDivElement).style.color = "#1e1d1d";
    (document.getElementById('difPrePropuestoVSPrePiso') as HTMLDivElement).style.color = "#1e1d1d";

    this.selectedUMSpan = "";
    this.selectedCodigoSpan = "";
    this.selectedDescripcionSpan = "";
    this.utilidadPrecioPiso = 0;

    this.validaVacios();
    this.limpiarCampos()
  }

  selectedCodigo(event: any) {
    let value = event.target.value;

    var codigo = this.codigo.find(resp => resp.codigo == value)
    try {
      this.selectedDescripcionSpan = codigo.descripcion; 
      this.selectedUMSpan = codigo.um;
      this.selectedCodigoSpan = value;
    } catch { }
    this.validaVacios();
  }

  borradoSpanCodigo(event: any) {
    
    if(event.key != undefined){
      this.selectedCodigoSpan = "";
    this.selectedDescripcionSpan = "";
    }
    
  }

  selectZona() {
    this.precioPiso.getZona().subscribe(res => {
      this.zona = res;
    });
  }

  validaZona(e: any) {
    this.validaVacios();
  }


  valuechange(newValue: any) {
    this.validaVacios();
  }

  loader() {
    //ACTIVA LOADER
    this.spinner.show();
    setTimeout(() => {
      this.spinner.hide();
    }, 2000);
  }

  loaderCheckbox(form: getDatosI) {
    //ACTIVA LOADER
    this.loader();
    this.consultarDatos(form);
  }

  consultarDatos(form: getDatosI) {
    this.precioPiso.getDatos(form).subscribe(res => {

      // COSTO PRECIO PISO
      this.preciopisoGral = (res.resultado.info.precioPiso).toFixed(2);
      this.pputilidadOperativaNeta = (res.resultado.infoPropuesto.utilidadOperativaNeta).toFixed(2);

      // COSTO PRECIO PROPUESTO
      this.pppreciopisoGral = (res.resultado.infoPropuesto.precioPiso).toFixed(2);

      //GAUGE CHART
      this.chartPrecioPropuesto = this.pppreciopisoGral;
      this.chartPrecioPiso = this.preciopisoGral;

      const colorAngulo = res.resultado.graficaDto.color;
      if (colorAngulo == 0) { // 0 ->Error de calculo
        this.angulo = 2;
      } if (colorAngulo == 1) { // 1 ->Verde
        this.angulo = 160;
      } if (colorAngulo == 2) { // 2 ->Rojo
        this.angulo = 20;
      } if (colorAngulo == 3) { // 3 ->Amarillo
        this.angulo = 110;
      } if (colorAngulo == 4) { // 4 ->Naranja
        this.angulo = 70;
      }

      this.costoVariable = res.resultado.graficaDto.analisisOportunidad;

      //UTILIDAD OPERATIVA NETA PRECIO PISO
      this.utilidadPrecioPiso = (res.resultado.porcentajePrecioPiso.utilidadOperativaNeta).toFixed(1);

      //UTILIDAD OPERATIVA NETA PRECIO PROPUESTO
      const utilidad = this.pputilidadOperativaNeta;
      if (utilidad >= 0) {
        this.utilidadNeta = 'Positiva "Creación de Valor"';
        (document.getElementById('utilidadNetaText') as HTMLDivElement).style.color = "green";
      } else {
        this.utilidadNeta = 'Negativa "Destrucción de Valor"';
        (document.getElementById('utilidadNetaText') as HTMLDivElement).style.color = "red";
      }

      //DIFERENCIA UTILIDAD PRECIO PROPUESTO VS PISO
      this.difPrePropuestoVSPrePiso = (res.resultado.graficaDto.precioPropuestoVPiso).toFixed(2);

      if (this.difPrePropuestoVSPrePiso >= 0) {
        (document.getElementById('difPrePropuestoVSPrePiso') as HTMLDivElement).style.color = "green";
      } else {
        (document.getElementById('difPrePropuestoVSPrePiso') as HTMLDivElement).style.color = "red";
      }

    }, (error) => {
      Swal.fire(
        '',
        error.error.resultado,
        'error'
      )
      this.limpiarCampos();
    })
  }


  limpiarCampos() {
    (document.getElementById('utilidadNetaText') as HTMLDivElement).style.color = "#1e1d1d";
    (document.getElementById('difPrePropuestoVSPrePiso') as HTMLDivElement).style.color = "#1e1d1d";
    this.preciopisoGral = 0;

    // UTILIDAD OPERATIVA NETA (GRAFICA)
    this.utilidadNeta = '-';

    //DIFERENCIA UTILIDAD
    this.difPrePropuestoVSPrePiso = 0;

    //GAUGE CHART
    this.angulo = 90;
    this.chartPrecioPropuesto = 0;
    this.chartPrecioPiso = 0;
    this.chartCostoVenta = 0;
    this.chartGastoCryogenico = 0;
    this.chartGastosVenta = 0;
  }
}
