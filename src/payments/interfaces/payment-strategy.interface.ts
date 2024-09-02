export interface PaymentStrategy {
  pay(bookingId: string): Promise<string>
  inActivePayment(bookingId: string): void
}
