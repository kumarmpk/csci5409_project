import {Component, OnDestroy, OnInit} from '@angular/core';
import { JobService } from '../shared/services/job.service';
import {Subscription} from 'rxjs';
import {OrderItem} from '../shared/models/order-item.model';
import {PartService} from '../shared/services/part.service';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html'
})
export class OrdersComponent implements OnInit, OnDestroy {

  orders: OrderItem[] = [];
  error = null;
  orderSub: Subscription;

  constructor(private jobService: JobService,
              public partService: PartService) { }

  ngOnInit() {
    this.onFetchOrders();
    this.partService.fetchParts();
  }

  ngOnDestroy() {
    this.orderSub.unsubscribe();
  }

  onFetchOrders() {
    this.orderSub = this.jobService.fetchOrders().subscribe(
        orders => {
          this.orders = orders;
        },
        error => {
          this.error = error.message;
        }
    );
  }
}
