import { Component, OnDestroy } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { RegistrationDataModel } from '../../models/user/registration-data.model';
import { CommonModule } from '@angular/common';
import { confirmPasswordValidator } from '../../shared/validators/confirm-password.validator';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { TranslocoDirective } from '@jsverse/transloco';
import { AuthService } from '../../core/authentication/auth.service';

@Component({
  selector: 'app-registration',
  standalone: true,
  imports: [
    MatInputModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    CommonModule,
    TranslocoDirective,
  ],
  templateUrl: './registration.component.html',
  styleUrl: './registration.component.scss',
})
export class RegistrationComponent implements OnDestroy {
  private ngUnsubscribe = new Subject();

  usernameValidators = { minLength: 5, maxLength: 25 };
  passwordValidators = { minLength: 8, maxLength: 25 };
  username = new FormControl('', [
    Validators.required,
    Validators.minLength(this.usernameValidators.minLength),
    Validators.maxLength(this.usernameValidators.maxLength),
  ]);
  password = new FormControl('', [
    Validators.required,
    Validators.minLength(this.passwordValidators.minLength),
    Validators.maxLength(this.passwordValidators.maxLength),
    Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[\W]).{1,}$/),
  ]);
  passwordConfirmation = new FormControl('', [Validators.required]);
  email = new FormControl('', [Validators.required, Validators.email]);
  myForm = new FormGroup(
    {
      username: this.username,
      password: this.password,
      passwordConfirmation: this.passwordConfirmation,
      email: this.email,
    },
    confirmPasswordValidator
  );

  constructor(private authService: AuthService, private router: Router) {}

  ngOnDestroy(): void {
    this.ngUnsubscribe.next({});
    this.ngUnsubscribe.complete();
  }

  onSubmit() {
    const registrationDataModel: RegistrationDataModel = {
      username: this.username.value as string,
      password: this.password.value as string,
      email: this.email.value as string,
    };

    this.authService
      .signUp(registrationDataModel)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: () => {
          this.router.navigate(['/home']);
        },
        error: (err) => {
          err.error.message === 'Username already exists' &&
            this.username.setErrors({ alreadyExist: true });

          err.error.message === 'Email already exists' &&
            this.email.setErrors({ alreadyExist: true });
        },
      });
  }
}
