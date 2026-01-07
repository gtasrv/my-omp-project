const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const fsp = require('fs').promises;
const iconv = require('iconv-lite');


let sampProcess = null;

const OMP_SERVER_PATH = path.resolve(__dirname, 'omp-server');
const GAMEMODES_DIR = path.resolve(__dirname, 'gamemodes');
const GAMEMODES_DIR_DEV = path.resolve(__dirname, 'gamemodes_dev');
const TARGET_GAMEMODES_AMX_FILE = path.join(GAMEMODES_DIR, 'new.amx');
const SOURCE_GAMEMODES_AMX_FILE_DEV = path.join(GAMEMODES_DIR_DEV, 'new.amx');

const isDev = process.env.isDev === '1';


function startServer() {
    if (sampProcess) {
        console.log('Сервер запущен уже.');
        return;
    }
    try {
        sampProcess = spawn(OMP_SERVER_PATH, [], {
            cwd: path.dirname(OMP_SERVER_PATH)
        });
        sampProcess.stdout.on('data', (data) => {
            const output = iconv.decode(data, 'cp1251');
            console.log(`${output}`);
        });
        sampProcess.stderr.on('data', (data) => {
            const errorOutput = iconv.decode(data, 'cp1251');
            console.error(`STDERR: ${errorOutput}`);
        });
        sampProcess.on('close', (code) => {
            console.log(`Сервер остановлен с кодом выхода ${code}`);
            sampProcess = null;
        }); 
    } catch (error) {
        console.error('Ошибка при запуске сервера:', error);
    }
}

function stopServer() {
    if (!sampProcess) {
        console.log('Сервер не запущен.');
        return;
    }
    console.log('Остановка сервера...');
    sampProcess.kill();
    sampProcess = null;
}

function restartServer() {
    if (!sampProcess) {
        console.log('Сервер не запущен.');
        return;
    }
    stopServer();
    setTimeout(() => {
        startServer();
    }, 7000);
}

async function copyFile() {
    const fileExists = fs.existsSync(SOURCE_GAMEMODES_AMX_FILE_DEV);
    if (!fileExists) {
        console.error(`Файл ${SOURCE_GAMEMODES_AMX_FILE_DEV} не найден!`);
        return;
    }
    try {
        await fsp.copyFile(SOURCE_GAMEMODES_AMX_FILE_DEV, TARGET_GAMEMODES_AMX_FILE);
        console.log('Файл gamemodes/new.amx успешно обновлен из gamemodes_dev/new.amx');
        restartServer();
    } catch (error) {
        console.error('Ошибка при копировании файла:', error);
        return;
    }
}

function setupDevMode() {
    if (!isDev) return;
    console.log('Режим разработки активирован.');
    if (!fs.existsSync(GAMEMODES_DIR)) fs.mkdirSync(GAMEMODES_DIR, { recursive: true });
    if (!fs.existsSync(GAMEMODES_DIR_DEV)) fs.mkdirSync(GAMEMODES_DIR_DEV, { recursive: true });
    if (!fs.existsSync(SOURCE_GAMEMODES_AMX_FILE_DEV)) {
         console.warn(`ВНИМАНИЕ: Файл ${SOURCE_GAMEMODES_AMX_FILE_DEV} не найден. Отслеживание не начато.`);
         return;
    }
    fs.watchFile(SOURCE_GAMEMODES_AMX_FILE_DEV, { interval: 2000 }, (curr, prev) => {
        if (curr.mtime.getTime() !== prev.mtime.getTime()) {
            console.log('Обнаружены изменения в gamemodes_dev/new.amx. Обновление gamemodes/new.amx...');
            copyFile();
        }
    });
}
function main() {
    setupDevMode();
    startServer();
}

main();
