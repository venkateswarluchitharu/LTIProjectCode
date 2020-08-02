import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';

import { Multiplex } from './../model/multiplex';
import { MultiplexDataService } from './../service/data/multiplex-data.service';
import { AuthenticationService } from '../service/authentication.service';
import { CustomValidatorsService } from './../service/custom-validators.service';


@Component({
  selector: 'app-multiplex-management',
  templateUrl: './multiplex-management.component.html',
  styleUrls: ['./multiplex-management.component.css']
})
export class MultiplexManagementComponent implements OnInit, AfterViewInit, OnDestroy {
  multiplexData: Multiplex[];
  multiplex: any = "";
  modalTitle: string;

  userId = this.authService.userId;

  multiplexName: string;
  address: string;
  numberOfScreens: number;

  multiplexFormGroup: FormGroup;
  constructor(private multiplexService: MultiplexDataService, private formBuilder: FormBuilder,
    private authService: AuthenticationService,
    private customValidators: CustomValidatorsService) {
    this.multiplexFormGroup = formBuilder.group({
      "multiplex_name": new FormControl("", Validators.compose([Validators.required, Validators.maxLength(30), this.customValidators.spaceValidator])),
      "address": new FormControl("", Validators.compose([Validators.required, Validators.maxLength(40), this.customValidators.spaceValidator])),
      "number_of_screen": new FormControl("", Validators.compose([Validators.required, this.customValidators.zeroAndNegativeNotAllowed, this.customValidators.maxNumberOfScreen]))
    });
  }

  getAllMultiplexData() {
    this.multiplexService.getallData().subscribe((data: Multiplex[]) => {
      this.multiplexData = data;
      this.rerender();
    }, (err) => {
      alert("Data not getting");
    });
  }

  saveMultiplex() {
    if (this.multiplex === "") {
      this.addMultiplex();
    } else {
      this.updateMultiplex();
    }
  }

  addMultiplex() {
    this.getValueFromForm();
    this.multiplexService.addMultiplex(new Multiplex(this.multiplexName, this.address, this.numberOfScreens), this.userId).subscribe(
      (response: Multiplex) => {
        this.multiplexData.push(response);
        alert("Multiplex added successfully!");
        this.getAllMultiplexData();
        this.rerender();
        this.multiplexFormGroup.reset();
      }, (err) => {
        alert("Multiplex added failure!");
      }
    );
  }

  getEachRowMultiplexDetails(id: string) {
    this.modalTitle = "EDIT";
    this.multiplexService.getOneMultiplex(id).subscribe(
      (data) => {
        this.multiplex = data;
        this.setValueToEditForm();
      }, (err) => {
        
      }
    );
  }

  setValueToEditForm() {
    this.multiplexFormGroup.controls['multiplex_name'].setValue(this.multiplex.multiplexName);
    this.multiplexFormGroup.controls['address'].setValue(this.multiplex.address);
    this.multiplexFormGroup.controls['number_of_screen'].setValue(this.multiplex.numberOfScreens);
  }

  getValueFromForm() {
    this.multiplexName = this.multiplexFormGroup.controls['multiplex_name'].value;
    this.address = this.multiplexFormGroup.controls['address'].value;
    this.numberOfScreens = this.multiplexFormGroup.controls['number_of_screen'].value;
  }

  onClickOnAdd() {
    this.modalTitle = "ADD";
    this.multiplexFormGroup.reset();
  }

  updateMultiplex() {
    this.getValueFromForm();
    this.multiplexService.updateMultiplex(this.multiplex.id, new Multiplex(this.multiplexName, this.address, this.numberOfScreens),
      this.userId).subscribe(
        (response: Multiplex) => {
          alert("Multiplex updated successfully!");
          this.getAllMultiplexData();
          this.rerender();
          this.multiplexFormGroup.reset();
          this.multiplex = "";
        }, (err) => {
          alert("Multiplex updated failure!");

        }
      );
  }

  onClickOnDelete() {
    this.multiplexService.deleteMultiplex(this.multiplex.id, this.userId).subscribe(
      (response) => {
        alert("Multiplex deleted successfully!");
        this.getAllMultiplexData();
        this.rerender();
        this.multiplexFormGroup.reset();
        this.multiplex = "";
      }, err => {
        alert("Multiplex delete failure!");

      }
    )
  }

  // data table implementation with rerendering of data
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();

  ngOnInit(): void {
    this.getAllMultiplexData();
    this.dtOptions = {
      pagingType: 'full_numbers',
      order: [1, 'asc'],
      pageLength: 9,
      processing: true,
      deferLoading: 4,
      responsive: true
    };
  }

  rerender(): void {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      // Destroy the table first
      dtInstance.destroy();
      // Call the dtTrigger to rerender again
      this.dtTrigger.next();
    });
  }

  ngAfterViewInit(): void {
    this.dtTrigger.next();
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }

}
