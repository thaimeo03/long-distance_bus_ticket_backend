export const convertToDateTimeRange = (departureDate: Date, startTime: number, endTime: number) => {
  const startDateTime = new Date(departureDate)
  const endDateTime = new Date(departureDate)

  startDateTime.setHours(startTime, 0, 0, 0) // Đặt giờ bắt đầu
  endDateTime.setHours(endTime, 0, 0, 0) // Đặt giờ kết thúc

  return { startDateTime, endDateTime }
}
