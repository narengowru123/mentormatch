import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { StudentRoutingModule } from './student-routing.module';

import { StudentDashboardComponent } from './pages/dashboard/student-dashboard.component';
import { StudentProfileComponent } from './pages/profile/student-profile.component';
import { BrowseMentorsComponent } from './pages/browse-mentors/browse-mentors.component';
import { MentorDetailComponent } from './pages/mentor-detail/mentor-detail.component';
import { MySessionsComponent } from './pages/my-sessions/my-sessions.component';

import { SubmitReviewComponent } from './pages/submit-review/submit-review.component';
import { MentorReviewsComponent } from './pages/mentor-reviews/mentor-reviews.component';
import { NotificationsComponent } from './pages/notifications/notifications.component';
import { NotificationBellComponent } from './components/notification-bell/notification-bell.component';
import { StudentNavbarComponent } from './components/student-navbar/student-navbar.component';
// add to declarations: StudentNavbarComponent
@NgModule({
  declarations: [
    StudentDashboardComponent,
    StudentProfileComponent,
    BrowseMentorsComponent,
    MentorDetailComponent,
    MySessionsComponent,
    SubmitReviewComponent,
    MentorReviewsComponent,
    NotificationsComponent,
    NotificationBellComponent,
    StudentNavbarComponent

  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    StudentRoutingModule
  ]
})
export class StudentModule {}
