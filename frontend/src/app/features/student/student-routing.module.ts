import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { StudentDashboardComponent } from './pages/dashboard/student-dashboard.component';
import { StudentProfileComponent } from './pages/profile/student-profile.component';
import { BrowseMentorsComponent } from './pages/browse-mentors/browse-mentors.component';
import { MentorDetailComponent } from './pages/mentor-detail/mentor-detail.component';
import { MySessionsComponent } from './pages/my-sessions/my-sessions.component';
import { SubmitReviewComponent } from './pages/submit-review/submit-review.component';
// Added by Gnaneshwar
import { NotificationsComponent } from './pages/notifications/notifications.component';

const routes: Routes = [
  { path: 'submit-review/:id', component: SubmitReviewComponent },
  { path: 'notifications', component: NotificationsComponent },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    component: StudentDashboardComponent
  },
  {
    path: 'profile',
    component: StudentProfileComponent
  },
  {
    path: 'mentors',
    component: BrowseMentorsComponent
  },
  {
    path: 'mentors/:id',
    component: MentorDetailComponent
  },
  { path: 'sessions',     component: MySessionsComponent },
  { path: 'sessions/:id', component: MySessionsComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StudentRoutingModule {}
