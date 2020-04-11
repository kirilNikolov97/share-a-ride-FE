import {Component, ElementRef, NgZone, OnInit, ViewChild} from '@angular/core';
import {Address} from '../../../model/address.model';
import {ActivatedRoute} from '@angular/router';
import {ProfileApiService} from '../../../_services/api/profile-api.service';
import {NavigationService} from '../../../_services/navigation.service';
import {City} from '../../../model/city.model';
import {MapsAPILoader} from '@agm/core';
import {NgForm} from '@angular/forms';


@Component({
  selector: 'app-edit-address',
  templateUrl: './edit-address.component.html',
  styleUrls: ['./edit-address.component.css']
})
export class EditAddressComponent implements OnInit {

  addressClass: Address;
  latitude: number;
  longitude: number;
  zoom: number;
  address: string;
  private geoCoder;
  showGoogleMaps: boolean;
  cities: City[];
  addressId: string;
  selectedCity: City;
  isValidFormSubmitted = false;


  @ViewChild('search', {static: false})
  public searchElementRef: ElementRef;

  constructor(
    private activatedRoute: ActivatedRoute,
    private apiServiceProfile: ProfileApiService,
    private navigate: NavigationService,
    private mapsAPILoader: MapsAPILoader,
    private ngZone: NgZone
  ) { }

  ngOnInit() {
    this.showGoogleMaps = false;
    this.selectedCity = new City();
    this.addressClass = new Address();
    this.apiServiceProfile.getAllCities().subscribe(res => {
      this.cities = res;
    });

    this.addressId = this.activatedRoute.snapshot.paramMap.get('id');
    this.apiServiceProfile.getAddressById(this.addressId).subscribe( res => {
      this.addressClass = res;
      this.selectedCity = res.city;
      this.longitude = res.longitude;
      this.latitude = res.latitude;
      console.log('RES ');
      console.log(this.addressClass);
      console.log('RES ');
    });

    this.loadLocationFromCoordinates();
    this.mapsAPILoader.load().then(() => {

      this.loadLocationFromCoordinates();
      this.geoCoder = new google.maps.Geocoder;

      let autocomplete = new google.maps.places.Autocomplete(this.searchElementRef.nativeElement, {
        types: ['address']
      });
      autocomplete.addListener('place_changed', () => {
        this.ngZone.run(() => {
          // get the place result
          let place: google.maps.places.PlaceResult = autocomplete.getPlace();

          // verify result
          if (place.geometry === undefined || place.geometry === null) {
            return;
          }

          // set latitude, longitude and zoom
          this.latitude = place.geometry.location.lat();
          this.longitude = place.geometry.location.lng();
          this.zoom = 12;
        });
      });
    });

  }

  private loadLocationFromCoordinates() {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.latitude = this.addressClass.latitude;
        this.longitude = this.addressClass.longitude;
        this.zoom = 15;
        this.getAddress(this.latitude, this.longitude);
      });
    }
  }

  private setCurrentLocation() {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.latitude = position.coords.latitude;
        this.longitude = position.coords.longitude;
        this.zoom = 15;
        this.getAddress(this.latitude, this.longitude);
      });
    }
  }

  markerDragEnd($event: any) {
    console.log($event);
    this.latitude = parseFloat($event.coords.lat);
    this.longitude = parseFloat($event.coords.lng);
    this.getAddress(this.latitude, this.longitude);
  }

  getAddress(latitude, longitude) {
    this.geoCoder.geocode({ 'location': { lat: latitude, lng: longitude } }, (results, status) => {
      console.log(results);
      console.log(status);
      if (status === 'OK') {
        if (results[0]) {
          this.zoom = 15;
          this.address = results[0].formatted_address;
          let arr = this.address.split(',');
          this.addressClass.street = arr[0];
          this.addressClass.district = arr[1].trim();
          // this.addressClass.city.name = arr[2];
          // console.log(this.addressClass.street + '  ' + this.addressClass.district + ' + ' + this.addressClass.city);
        } else {
          window.alert('No results found');
        }
      } else {
        window.alert('Geocoder failed due to: ' + status);
      }
    });
  }


  onSubmit(form: NgForm) {
    this.isValidFormSubmitted = false;
    if (form.invalid) {
      return;
    }
    this.isValidFormSubmitted = true;

    this.addressClass.latitude = this.latitude;
    this.addressClass.longitude = this.longitude;
    this.apiServiceProfile.updateAddress(this.addressClass).subscribe(res => {
      this.navigate.open('profile/address');
    });
  }


  change() {
    this.showGoogleMaps = !this.showGoogleMaps;
  }
}
