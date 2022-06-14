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


  //FORM
  filterForm = new FormGroup({
    linea: new FormControl('', Validators.required),
    codigo: new FormControl('', Validators.required),
    zona: new FormControl('', Validators.required),
    propuesto: new FormControl('', Validators.required),
    volumen: new FormControl('', Validators.required),
    tipoOperacion: new FormControl(false, Validators.nullValidator),
  })

  constructor(private precioPiso: PrecioPisoDAOService, private spinner: NgxSpinnerService) { }

  ngOnInit(): void {
    this.selectLinea();
    this.selectZona();
  }

  selectLinea() {
    this.precioPiso.getLinea().subscribe(res => {
      this.linea = res;

    });
  }

  selectCodigo(event: any) {
    let value = event.target.value;
    console.log(value)
    this.precioPiso.getCodigo(value).subscribe(res => {
      this.codigo = res;
    });
  }

  selectZona() {
    this.precioPiso.getZona().subscribe(res => {
      this.zona = res;
    });
  }

  loader() {
    //ACTIVA LOADER
    this.spinner.show();
    setTimeout(() => {
      this.spinner.hide();
    }, 2000);
  }


  consultarDatos(form: getDatosI) {
    this.precioPiso.getDatos(form).subscribe(res => {


      // COSTO PRECIO PISO
      this.preciopisoGral = res.resultado.info.precioPiso;
      this.pputilidadOperativaNeta = res.resultado.infoPropuesto.utilidadOperativaNeta;

      // COSTO PRECIO PROPUESTO
      this.pppreciopisoGral = res.resultado.infoPropuesto.precioPiso;

      //GAUGE CHART
      this.chartPrecioPropuesto = this.pppreciopisoGral;
      this.chartPrecioPiso = this.preciopisoGral;

      const colorAngulo = res.resultado.graficaDto.color;
      if (colorAngulo == 0) { // 0 ->Error de calculo
        this.angulo = -5;
      } if (colorAngulo == 1) { // 1 ->Verde
        this.angulo = 170;
      } if (colorAngulo == 2) { // 2 ->Rojo
        this.angulo = 10;
      } if (colorAngulo == 3) { // 3 ->Amarillo
        this.angulo = 120;
      } if (colorAngulo == 4) { // 4 ->Naranja
        this.angulo = 60;
      }

      this.costoVariable = res.resultado.graficaDto.analisisOportunidad;

      //UTILIDAD OPERATIVA NETA
      const utilidad = this.pputilidadOperativaNeta;
      if (utilidad >= 0) {
        this.utilidadNeta = 'Positiva "Creación de Valor"';
        (document.getElementById('utilidadNetaText') as HTMLDivElement).style.color = "green";
      } else {
        this.utilidadNeta = 'Negativa "Destrucción de Valor"';
        (document.getElementById('utilidadNetaText') as HTMLDivElement).style.color = "red";
      }

      //DIFERENCIA UTILIDAD PRECIO PROPUESTO VS PISO
      this.difPrePropuestoVSPrePiso = res.resultado.graficaDto.precioPropuestoVPiso;
      console.log(this.difPrePropuestoVSPrePiso);
      
      if( this.difPrePropuestoVSPrePiso >= 0){
        (document.getElementById('difPrePropuestoVSPrePiso') as HTMLDivElement).style.color = "green";
      }else{
        (document.getElementById('difPrePropuestoVSPrePiso') as HTMLDivElement).style.color = "red";
      }

    }, (errorServicio) => {
      console.log(errorServicio);
      Swal.fire(
        'Intenta nuevamente',
        'La consulta no fue validada',
        'error'
      )
    })

  }
}
