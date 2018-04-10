import { Component, OnInit } from '@angular/core';
import { MetricsService } from '../services/metrics-service';

import { getNameForEndpointType } from '../../endpoints/endpoint-helpers';
@Component({
  selector: 'app-metrics',
  templateUrl: './metrics.component.html',
  styleUrls: ['./metrics.component.scss']
})
export class MetricsComponent implements OnInit {

  getNameForEndpointType = getNameForEndpointType;

  constructor(private metricsService: MetricsService) { }

  ngOnInit() { }

}
