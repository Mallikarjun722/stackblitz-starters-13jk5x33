const MIN = 100;
const MAX = 999;
const pinInput = document.getElementById('pin');
const sha256HashView = document.getElementById('sha256-hash');
const resultView = document.getElementById('result');

// a function to store in the local storage
function store(key, value) {
  localStorage.setItem(key, value);
}

// a function to retrieve from the local storage
function retrieve(key) {
  return localStorage.getItem(key);
}

function getRandomArbitrary(min, max) {
  let cached;
  cached = Math.random() * (max - min) + min;
  cached = Math.floor(cached);
  return cached;
}

// a function to clear the local storage
function clear() {
  localStorage.clear();
}

// a function to generate sha256 hash of the given string
async function sha256(message) {
  // encode as UTF-8
  const msgBuffer = new TextEncoder().encode(message);

  // hash the message
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);

  // convert ArrayBuffer to Array
  const hashArray = Array.from(new Uint8Array(hashBuffer));

  // convert bytes to hex string
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return hashHex;
}

async function getSHA256Hash() {
  let cached = retrieve('sha256');
  if (cached) {
    return cached;
  }

  const randomNumber = getRandomArbitrary(MIN, MAX);
  cached = await sha256(randomNumber.toString());
  store('sha256', cached);
  return cached;
}

async function main() {
  sha256HashView.innerHTML = 'Calculating...';
  const hash = await getSHA256Hash();
  sha256HashView.innerHTML = hash;
}

async function test() {
  const pin = pinInput.value;

  if (pin.length !== 3) {
    resultView.innerHTML = '💡 Hint: Enter exactly 3 digits';
    resultView.classList.remove('hidden');
    return;
  }

  const hashedPin = await sha256(pin);
  const targetHash = sha256HashView.innerHTML;

  if (hashedPin === targetHash) {
    resultView.innerHTML =
      "🎉 Success! You've correctly decoded the hash. Try clearing your cache for a new challenge!";
    resultView.classList.add('success');
  } else {
    const message =
      parseInt(pin) < MIN || parseInt(pin) > MAX
        ? '❌ Remember: The number is between 100 and 999'
        : '❌ Not quite right. Keep trying!';
    resultView.innerHTML = message;
  }
  resultView.classList.remove('hidden');
}

// ensure pinInput only accepts numbers and is 3 digits long
pinInput.addEventListener('input', (e) => {
  const { value } = e.target;
  pinInput.value = value.replace(/\D/g, '').slice(0, 3);
});

// attach the test function to the button
document.getElementById('check').addEventListener('click', test);

// Add clear button functionality
const clearButton = document.createElement('button');
clearButton.textContent = 'New Challenge';
clearButton.style.marginLeft = '8px';
clearButton.onclick = () => {
  clear();
  location.reload();
};
document.getElementById('user-input').appendChild(clearButton);

main();
