import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

import 'dayjs/locale/vi';

// Extend dayjs with plugins
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);

// Set default locale to Vietnamese
dayjs.locale('vi');

// Set default timezone to Asia/Ho_Chi_Minh (UTC+7)
dayjs.tz.setDefault('Asia/Ho_Chi_Minh');

export default dayjs;
