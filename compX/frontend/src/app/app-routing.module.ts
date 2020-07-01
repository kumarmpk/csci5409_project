import { JobItemComponent } from './jobs/job-item/job-item.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { OrdersComponent } from './orders/orders.component';

const routes: Routes = [
  { path: '', component: JobItemComponent, pathMatch: 'full' },
  { path: 'orders', component: OrdersComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
