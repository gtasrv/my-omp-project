const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const fsp = require('fs').promises;
const iconv = require('iconv-lite');


const OMP_SERVER_PATH = path.resolve(__dirname, 'omp-server');
const GAMEMODES_DIR = path.resolve(__dirname, 'gamemodes');
const GAMEMODES_DIR_DEV = path.resolve(__dirname, 'gamemodes_dev');
const TARGET_AMX = path.join(GAMEMODES_DIR, 'new.amx');
const SOURCE_AMX = path.join(GAMEMODES_DIR_DEV, 'new.amx');

const isDev = process.env.isDev === '1';
let sampProcess = null;
let isRestarting = false;
let debounceTimer = null;



function startServer() {
  if (sampProcess) {
    console.log('Сервер уже запущен.');
    return;
  }
  try {
    sampProcess = spawn(OMP_SERVER_PATH, [], {
      cwd: path.dirname(OMP_SERVER_PATH),
    });
    sampProcess.stdout.on('data', (data) => {
      process.stdout.write(iconv.decode(data, 'cp1251'));
    });
    sampProcess.stderr.on('data', (data) => {
      process.stderr.write('STDERR: ' + iconv.decode(data, 'cp1251'));
    });
    sampProcess.on('close', (code) => {
      console.log(`Сервер упал (код ${code})`);
      sampProcess = null;
      if (isRestarting) {
          isRestarting = false;
          startServer();
      }
    });
    sampProcess.on('error', (err) => {
      console.error('Ошибка запуска сервера:', err.message);
      sampProcess = null;
    });
  } catch (err) {
    console.error('Не удалось запустить сервер:', err.message);
  }
}

function stopServer() {
  if (!sampProcess) {
    console.log('Сервер не запущен.');
    return;
  }
  console.log('Остановка сервера...');
  sampProcess.kill('SIGTERM');
}

function restartServer() {
  if (!sampProcess) {
      startServer();
      return;
  }
  isRestarting = true;
  stopServer();

}
async function copyAndRestart() {
  if (!fs.existsSync(SOURCE_AMX)) {
    console.error(`Файл не найден: ${SOURCE_AMX}`);
    return;
  }
  try {
    await fsp.copyFile(SOURCE_AMX, TARGET_AMX);
    console.log('gamemodes/new.amx обновлён из gamemodes_dev/new.amx');
    restartServer();
  } catch (err) {
    console.error('Ошибка копирования:', err.message);
  }
}

function setupDevMode() {
  if (!isDev) return;
  console.log('Режим разработки активирован.');

  fs.mkdirSync(GAMEMODES_DIR, { recursive: true });
  fs.mkdirSync(GAMEMODES_DIR_DEV, { recursive: true });

  if (!fs.existsSync(SOURCE_AMX)) {
    console.warn(`ВНИМАНИЕ: ${SOURCE_AMX} не найден — слежение не начато.`);
    return;
  }

  let lastMtime = fs.statSync(SOURCE_AMX).mtimeMs;

  setInterval(() => {
    try {
      const stat = fs.statSync(SOURCE_AMX);
      if (stat.mtimeMs !== lastMtime) {
        lastMtime = stat.mtimeMs;
        console.log('Изменение обнаружено → обновление и рестарт...');
        copyAndRestart();
      }
    } catch (err) {
      console.error('Ошибка проверки файла:', err.message);
    }
  }, 1000);
}

function shutdown() {
    console.log('\nЗавершение...');
    if (sampProcess) {
        sampProcess.once('close', () => process.exit(0));
        stopServer();
        setTimeout(() => process.exit(1), 5000);
    } else {
        process.exit(0);
    }
}


process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

setupDevMode();
startServer();
