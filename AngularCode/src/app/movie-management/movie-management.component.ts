import { Component, OnDestroy, OnInit, ViewChild, AfterViewInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';

import { MovieDataService } from './../service/data/movie-data.service';
import { Movie } from './../model/movie'
import { AuthenticationService } from '../service/authentication.service';
import { CustomValidatorsService } from './../service/custom-validators.service';

@Component({
  selector: 'app-movie-management',
  templateUrl: './movie-management.component.html',
  styleUrls: ['./movie-management.component.css']
})
export class MovieManagementComponent implements OnInit, AfterViewInit, OnDestroy {
  movieData: Movie[];
  movie: any = "";
  modalTitle: string;
  userId = this.authService.userId;

  movieName: string;
  movieCategory: string;
  movieProducer: string;
  movieDirector: string;
  releaseDate: string;

  movieFormGroup: FormGroup;
  constructor(private movieService: MovieDataService, private formBuilder: FormBuilder,
    private authService: AuthenticationService,
    private customValidators: CustomValidatorsService) {
    this.movieFormGroup = formBuilder.group({
      "movie_name": new FormControl("", Validators.compose([Validators.required, Validators.maxLength(30), this.customValidators.spaceValidator])),
      "category": new FormControl("", Validators.compose([Validators.required, Validators.maxLength(30), this.customValidators.spaceValidator])),
      "producer": new FormControl("", Validators.compose([Validators.required, Validators.maxLength(30), this.customValidators.spaceValidator])),
      "director": new FormControl("", Validators.compose([Validators.required, Validators.maxLength(30), this.customValidators.spaceValidator])),
      "release_date": new FormControl("", Validators.compose([Validators.required, this.customValidators.dateValidator]))
    });
  }

  getAllMovieData() {
    this.movieService.getallData().subscribe((data: Movie[]) => {
      this.movieData = data;
      this.rerender();
    }, (err) => {
      alert("No Responce Data")
    });
  }

  saveMovie() {
    if (this.movie === "") {
      this.addMovie();
    } else {
      this.updateMovie();
    }
  }

  addMovie() {
    this.getValueFromForm();
    this.movieService.addMovie(new Movie(this.movieName, this.movieCategory, this.movieProducer,
      this.movieDirector, this.releaseDate), this.userId).subscribe(
        (response: Movie) => {
          this.movieData.push(response);
          alert("Movie added successfully!");
          this.getAllMovieData();
          this.rerender();
          this.movieFormGroup.reset();
        }, (err) => {
          alert("Movie added failure");
        }
      );
  }

  getEachRowMovieDetails(id: string) {
    this.modalTitle = "EDIT";
    this.movieService.getOneMovie(id).subscribe(
      (data) => {
        this.movie = data;
        this.setValueToEditForm();
      }, (err) => {
      }
    );
  }

  setValueToEditForm() {
    this.movieFormGroup.controls['movie_name'].setValue(this.movie.movieName);
    this.movieFormGroup.controls['category'].setValue(this.movie.movieCategory);
    this.movieFormGroup.controls['producer'].setValue(this.movie.movieProducer);
    this.movieFormGroup.controls['director'].setValue(this.movie.movieDirector);
    this.movieFormGroup.controls['release_date'].setValue(this.movie.releaseDate);
  }

  getValueFromForm() {
    this.movieName = this.movieFormGroup.controls['movie_name'].value;
    this.movieCategory = this.movieFormGroup.controls['category'].value;
    this.movieProducer = this.movieFormGroup.controls['producer'].value;
    this.movieDirector = this.movieFormGroup.controls['director'].value;
    this.releaseDate = this.movieFormGroup.controls['release_date'].value;
  }

  onClickOnAdd() {
    this.modalTitle = "ADD";
    this.movieFormGroup.reset();
  }

  updateMovie() {
    this.getValueFromForm();
    this.movieService.updateMovie(this.movie.id, new Movie(this.movieName, this.movieCategory,
      this.movieProducer, this.movieDirector, this.releaseDate), this.userId).subscribe(
        (response: Movie) => {
          alert("Movie updated successfully!");
          this.getAllMovieData();
          this.rerender();
          this.movieFormGroup.reset();
          this.movie = "";
        }, (err) => {
          alert("Movie update failure");
        }
      );
  }

  onClickOnDelete() {
    this.movieService.deleteMovie(this.movie.id, this.userId).subscribe(
      (response) => {
        alert("Movie deleted successfully!");
        this.getAllMovieData();
        this.rerender();
        this.movieFormGroup.reset();
        this.movie = "";
      }, err => {
        alert("Movie delete failure!");
      }
    )
  }

  // data table implementation with rerendering of data
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();

  ngOnInit(): void {
    this.getAllMovieData();
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
