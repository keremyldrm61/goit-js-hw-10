// flatpickr Kütüphanesi
// Belgelerde açıklandığı gibi
import flatpickr from "flatpickr";
// Ek stil dosyalarını içe aktar
import "flatpickr/dist/flatpickr.min.css";

// iziToast Kütüphanesi
import iziToast from "izitoast";
import "izitoast/dist/css/iziToast.min.css"

// DOM elementlerini seçmek için
const datetimePicker = document.querySelector("#datetime-picker");
const startButton = document.querySelector("[data-start]");
const daysSpan = document.querySelector("[data-days]");
const hoursSpan = document.querySelector("[data-hours]");
const minutesSpan = document.querySelector("[data-minutes]");
const secondsSpan = document.querySelector("[data-seconds]");

// Zamanlayıcı kimliğini tutmak için
let timerId = null;

// flatpickr kütüphanesi ayarları ve tarih seçimi
// Bu seçilen tarihi onClose() yönteminde geçmiş/gelecek doğrulamasından sonra bu let değişkenine kaydetmek için
let userSelectedDate = null;

const options = {
  enableTime: true,
  time_24hr: true,
  defaultDate: new Date(),
  minuteIncrement: 1,
  onClose(selectedDates) {
      const selectedDate = selectedDates[0];
      const nowDate = new Date();

      if (selectedDate <= nowDate) {
          // Geçmiş tarih seçildiyse
          iziToast.error({
              title: "Error",
              message: "Please choose a date in the future",
              position: "topRight"
          });
          startButton.disabled = true;
          userSelectedDate = null;
      } else {
          // Gelecek tarih seçildiyse
          userSelectedDate = selectedDate;
          startButton.disabled = false;
      }
  },
};

flatpickr(datetimePicker, options);

// Zaman Biçimlendirme | Başına sıfır ekleme fonksiyonu
function addLeadingZero(value) {
    return String(value).padStart(2, "0");
}

// Zaman Sayacı Fonksiyonu
function convertMs(ms) {
  // Number of milliseconds per unit of time
  const second = 1000;
  const minute = second * 60;
  const hour = minute * 60;
  const day = hour * 24;

  // Remaining days
  const days = Math.floor(ms / day);
  // Remaining hours
  const hours = Math.floor((ms % day) / hour);
  // Remaining minutes
  const minutes = Math.floor(((ms % day) % hour) / minute);
  // Remaining seconds
  const seconds = Math.floor((((ms % day) % hour) % minute) / second);

  return { days, hours, minutes, seconds };
}

console.log(convertMs(2000)); // {days: 0, hours: 0, minutes: 0, seconds: 2}
console.log(convertMs(140000)); // {days: 0, hours: 0, minutes: 2, seconds: 20}
console.log(convertMs(24140000)); // {days: 0, hours: 6 minutes: 42, seconds: 20}

// Başlangıçta start butonu devre dışı kalması için
startButton.disabled = true;

// start butonuna tıklandığında çağrılacak fonksiyon
startButton.addEventListener("click", () => {
    if (!userSelectedDate) return;

    startButton.disabled = true;
    datetimePicker.disabled = true;

    // Zamanlayıcıyı başlatmak için
    timerId = setInterval(() => {
        const date = new Date();
        const difference = userSelectedDate - date;

        if (difference <= 0) {
            // Zaman doldu
            clearInterval(timerId);
            timerId = null;
            updateTimerDisplay({ days: 0, hours: 0, minutes: 0, seconds: 0 });
            iziToast.success({
                title: "Done!",
                message: "Countdown finished!",
                position: "topRight"
            });
            return;
        }

        const timeLeft = convertMs(difference);
        updateTimerDisplay(timeLeft);
    }, 1000);
});

function updateTimerDisplay({ days, hours, minutes, seconds }) {
    daysSpan.textContent = addLeadingZero(days);
    hoursSpan.textContent = addLeadingZero(hours);
    minutesSpan.textContent = addLeadingZero(minutes);
    secondsSpan.textContent = addLeadingZero(seconds);
}