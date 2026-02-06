import Crypto from "crypto-js";
// import { useDispatch } from "react-redux";

const keyCrypto = "P4ssw0rd3ndCr7pt"

export const Process_System = {
    process_Success: "Success",
    process_Error: "Error",
    process_Failed: "Failed",
    process_Duplicate: "Duplicate Data",
};

export const actionBlockUI = () => {
    return { type: "BLOCK_UI" };
};

export const actionUnBlockUI = () => {
    return { type: "UNBLOCK_UI" };
};

// export const FnBlock_UI = () => {
//     const Dispatch = useDispatch();
//     const BlockUI = () => Dispatch(actionBlockUI());
//     const UnBlockUI = () => Dispatch(actionUnBlockUI());
//     return { BlockUI, UnBlockUI };
// };

export const Encrypt = (dataEncrypt) => {
    let data = dataEncrypt + "";

    let result = Crypto.AES.encrypt(data, keyCrypto).toString();
    ;
    result = result.replace(/\//g, "s14sh").replace(/\+/g, 'p1u5');

    return result
}

export const Decrypt = (dataDecrypt) => {
    if (dataDecrypt !== null) {
        dataDecrypt = dataDecrypt + "";
        dataDecrypt = dataDecrypt.replace(/s14sh/g, '/').replace(/p1u5/g, '+')
        let bytes = Crypto.AES.decrypt(dataDecrypt, keyCrypto);
        let result = bytes.toString(Crypto.enc.Utf8)
        return result
    } else {
        return "";
    }
}

export const IsEmpty = (value) => {
    if (value === null || value === undefined || value === "") return true;
    else return false;
};

export const IsNumeric = (sVal) => {
    sVal = (sVal + "").replace(/,/g, "");
    return !isNaN(sVal) && sVal !== "";
};

export const ParseFloatToZero = (sVal) => {
    sVal = (sVal + "").replace(/,/g, "");
    return !isNaN(parseFloat(sVal)) ? parseFloat(sVal) : 0;
};

export const ParseFloatToNull = (sVal) => {
    sVal = (sVal + "").replace(/,/g, "");
    return !isNaN(parseFloat(sVal)) ? parseFloat(sVal) : null;
};

export const ParseNumberToNull = (sVal) => {
    sVal = (sVal + "").replace(/,/g, "");
    return !isNaN(Number(sVal)) ? Number(sVal) : null;
};

export const ParseNumberToZero = (sVal) => {
    sVal = (sVal + "").replace(/,/g, "");
    return !isNaN(Number(sVal)) ? Number(sVal) : 0;
};

export const addCommas = (nStr) => {
    nStr += "";
    let x = nStr.split(".");
    let x1 = x[0];
    let x2 = x.length > 1 ? "." + x[1] : "";
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
        x1 = x1.replace(rgx, "$1" + "," + "$2");
    }
    return x1 + x2;
};

export const SetFormatNumber = (nNumber, nDecimal, sEmpty) => {
    if (IsNumeric(nNumber)) {
        if (IsNumeric(nDecimal)) return addCommas(nNumber.toFixed(nDecimal));
        else return addCommas(nNumber);
    } else {
        return !nNumber ? (sEmpty === undefined ? "" : sEmpty) : nNumber;
    }
};

export const sysParseFloat = (value) => {
    value = (value + "").replace(/ /g, "").replace(/,/g, "");
    if (IsNumeric(value)) {
        return parseFloat(value);
    } else {
        return null;
    }
};

export const sysSumValue = (arrValue) => {
    let nSum = null;
    if (arrValue) {
        arrValue.forEach((value) => {
            if (value) {
                nSum = (nSum || 0) + value;
            }
        });
    }
    return nSum;
};

export const ParseHtml = (val) => {
    if (val) return ParseHtml(val);
    else return val;
};

export const lnkToLogin = () => {
    let el = document.getElementById("lnkToLogin");
    el && el.click();
};

export const formatNumber = (num, digit) => {
    return parseFloat(num).toFixed(digit).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
}

export const formatNationalID = (value) => {
    return value
        .replace(/\s?/g, "")
        .replace(
            /(\d{1})(\d{4})(\d{5})(\d{2})(\d{1})/,
            "$1-$2-$3-$4-$5"
        )
        .trim();
}

export const formatAccountNo = (value) => {
    return value
        .replace(/\s?/g, "")
        .replace(
            /(\d{3})(\d{1})(\d{5})(\d{1})/,
            "$1-$2-$3-$4"
        )
        .trim();
}

export const addOneDay = (date) => {
    const newDate = new Date(date)           // สร้างสำเนาใหม่
    newDate.setDate(newDate.getDate() + 1)   // บวก 1 วัน
    return newDate
}

export const addSixMonths = (date) => {
    const newDate = new Date(date)
    const originalDay = newDate.getDate()
    newDate.setMonth(newDate.getMonth() + 6)
    if (newDate.getDate() < originalDay) {
        newDate.setDate(0)
    }
    return newDate
}





export const parseDateString = (input) => {
    // 1) Already a Date
    if (input instanceof Date) return input;

    // 2) Numeric: treat as UNIX timestamp (sec or ms)
    if (typeof input === 'number') {
        const ms = input >= 1e12 ? input : input * 1000; // 13+ digits -> ms, else sec
        return new Date(ms);
    }

    // 3) Nullish
    if (input == null) return new Date(NaN);

    // 4) Trim to string
    const s = String(input).trim();
    if (!s) return new Date(NaN);

    // 5) Direct Date parse (handles ISO like 2025-12-18T14:30:00Z)
    const direct = new Date(s);
    if (!isNaN(direct.getTime())) return direct;

    // 6) YYYY-MM-DD หรือ YYYY/MM/DD พร้อมเวลา (optional)
    //    เช่น "2025-12-18", "2025/12/18 14:30", "2025-12-18T14:30:00"
    let m = s.match(
        /^(\d{4})-/ - /(?: T:(\d{2})(?::(\d{2}))?)?$/
    );
    if (m) {
        const [_, yyyy, mm, dd, HH = '0', MM = '0', SS = '0'] = m;
        return new Date(
            Number(yyyy),
            Number(mm) - 1,
            Number(dd),
            Number(HH),
            Number(MM),
            Number(SS)
        );
    }

    // 7) DD/MM/YYYY หรือ DD-MM-YYYY พร้อมเวลา (optional)
    //    เช่น "18/12/2025", "18-12-2025 14:30"
    m = s.match(
        /^(\d{1,2})/ - /-(?: T:(\d{2})(?::(\d{2}))?)?$/
    );
    if (m) {
        const [_, dd, mm, yyyy, HH = '0', MM = '0', SS = '0'] = m;
        const d = Number(dd);
        const mth = Number(mm);
        const Y = Number(yyyy);

        let day = d;
        let month = mth;

        // แก้เคสกำกวมกับ MM/DD/YYYY:
        if (d <= 12 && mth <= 12) {
            // ambiguous -> default เป็น DD/MM/YYYY (ตามไทย)
            day = d;
            month = mth;
        } else if (d > 12 && mth <= 12) {
            // ชัดว่า DD/MM/YYYY
            day = d;
            month = mth;
        } else if (mth > 12 && d <= 12) {
            // ชัดว่า MM/DD/YYYY -> สลับ
            day = mth;
            month = d;
        } else {
            // fallback DD/MM/YYYY
            day = d;
            month = mth;
        }

        return new Date(
            Y,
            month - 1,
            day,
            Number(HH),
            Number(MM),
            Number(SS)
        );
    }

    // 8) YYYYMMDD
    m = s.match(/^(\d{4})(\d{2})(\d{2})$/);
    if (m) {
        const [_, yyyy, mm, dd] = m;
        return new Date(Number(yyyy), Number(mm) - 1, Number(dd));
    }

    // 9) ตัวเลขล้วน -> timestamp (sec หรือ ms)
    if (/^\d+$/.test(s)) {
        const num = Number(s);
        const ms = s.length >= 13 ? num : num * 1000;
        return new Date(ms);
    }

    // 10) พาร์สไม่ได้
    return new Date(NaN);
};
