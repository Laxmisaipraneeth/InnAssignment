import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { HelperComponent } from './helper/helper.component';
import { EditComponent } from './edit/edit.component';
import { IdCardComponent } from './id-card/id-card.component';

const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'add-helper', component: HelperComponent },
  {path:'edit-helper/:id',component:EditComponent},
  {path:'id',component:IdCardComponent}
];

export default routes;
