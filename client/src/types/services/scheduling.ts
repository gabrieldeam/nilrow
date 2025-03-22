export enum ShippingMode {
    DELIVERY = 'DELIVERY',
    PICKUP = 'PICKUP',
  }

  export interface SchedulingDTO {
    id: string;
    catalogId: string;
    active: boolean;
    shippingMode: ShippingMode;
  }

  export interface SchedulingIntervalDTO {
    id: string;
    schedulingId: string;
    startTime: string;
    endTime: string;
    maxAppointments: number;
  }
  