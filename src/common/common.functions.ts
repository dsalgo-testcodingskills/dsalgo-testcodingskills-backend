import { config } from 'dotenv';
import { BadRequestException } from '@nestjs/common';
import * as sgMail from '@sendgrid/mail';
import * as nodeMailer from 'nodemailer';

const smtpTransport = require('nodemailer-smtp-transport');
config();

const authuser = process.env.MAIL_AUTH_USERNAME;
const authPassword = process.env.MAIL_AUTH_PASSWORD;

const transporter = nodeMailer.createTransport(
  smtpTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    auth: {
      user: authuser,
      pass: authPassword,
    },
  }),
);

//set API key for send grid
sgMail.setApiKey(process.env.SENDGRID_KEY);

type mailOptions = {
  from: string;
  to: string[];
  subject: string;
  text?: string;
  html?: string;
  cc?: string[];
  bcc?: string[];
};

function invitationHTML(link, text, logo) {
  let logoTemplate = '';
  if (logo) {
    logoTemplate = `
  <!DOCTYPE html>
  <html style="font-weight: 300">
    <head style="font-weight: 300">
      <meta charset="utf-8" style="font-weight: 300" />
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1"
        style="font-weight: 300"
      />
      <style type="text/css" style="font-weight: 300">
        @import url(https://fonts.googleapis.com/css?family=Open+Sans:400,700);
      </style>
    </head>
    <body
      class=""
      style="
        font-size: 16px;
        color: #2f2936;
        padding: 0;
        font-family: 'Lato', 'Helvetica Neue', helvetica, sans-serif;
        background-image: url(https://codeb.online/assets/svg/binary_numbers.svg)
          #fff;
        -webkit-font-smoothing: antialiased;
        width: 100%;
        font-weight: 300;
        margin: 0;
        background-color: #fff;
      "
    >
      <div
        class="preheader"
        style="
          padding: 0;
          font-size: 0;
          display: none;
          max-height: 0;
          font-weight: 300;
          mso-hide: all;
          line-height: 0;
        "
      ></div>
      <table
        class="main"
        style="
          border-radius: 10px;
          font-size: 16px;
          color: #2f2936;
          border-collapse: separate;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          border-spacing: 0;
          max-width: 700px;
          font-family: 'Lato', 'Helvetica Neue', helvetica, sans-serif;
          border: 1px solid #c7d0d4;
          padding: 0;
          -webkit-font-smoothing: antialiased;
          width: 100%;
          font-weight: 300;
          margin: 15px auto;
          background-color: #fff;
        "
      >
        <tr style="font-weight: 300">
          <td style="padding: 0; font-weight: 300; margin: 0; text-align: center">
            <div
              class="header"
              style="
                padding: 15px 0;
                font-size: 14px;
                font-weight: 300;
                border-bottom: 1px solid #dee7eb;
              "
            >
              <div
                class="container"
                style="
                  padding: 0 20px;
                  max-width: 600px;
                  font-weight: 300;
                  text-align: left;
                "
              >
                <img
                  src="https://algo-user-images.s3.us-east-2.amazonaws.com/organization/ALGO.jpg"
                  width="120px"
                  height="auto"
                  alt="algo"
                />
                <img
                src=${logo}
                alt="organizationLogo"
                style="float: right; position: relative; left: 60px; max-height: 65px; max-width: 100px; border-radius: 50%;"
                onerror='this.style.display ="none"'
              />
              </div>
            </div>
          </td>
        </tr>
        <tr style="font-weight: 300">
          <td style="padding: 0; font-weight: 300; margin: 0; text-align: center">
            <div
              class="container"
              style="
                padding: 0 20px;
                max-width: 600px;
                font-weight: 300;
                text-align: left;
              "
            >
              <div
                class="inner"
                style="
                  padding: 30px 0 20px;
                  font-weight: 300;
                  background-color: #fff;
                "
              >
                <h3 style="font-size: 18px; font-weight: 700; margin: 0 0 20px">
                  Algo Coding Invitation
                </h3>
                <p
                  style="
                    font-weight: 300;
                    margin: 0 0 15px;
                    font-size: 16px;
                    line-height: 24px;
                  "
                >
                  ${text}
                </p>
                <p
                  style="
                    font-weight: 300;
                    margin: 0 0 15px;
                    font-size: 16px;
                    line-height: 24px;
                    text-align: center;
                  "
                >
                  <a
                    href="${link}"
                    class="btn"
                    style="
                      color: #fff;
                      cursor: pointer;
                      border-radius: 50rem;
                      background-color: #00bcd4;
                      border-color: #00bcd4;
                      font-weight: 400;
                      line-height: 1.5;
                      text-align: center;
                      text-decoration: none;
                      vertical-align: middle;
                      padding: 0.5rem 1.5rem;
                      font-size: 1rem;
                    "
                    >Give Test</a
                  >
                </p>
              </div>
            </div>
          </td>
        </tr>
      </table>
    </body>
  </html>  
`;
  } else {
    logoTemplate = `
    <!DOCTYPE html>
<html style="font-weight: 300">
  <head style="font-weight: 300">
    <meta charset="utf-8" style="font-weight: 300" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1"
      style="font-weight: 300"
    />
    <style type="text/css" style="font-weight: 300">
      @import url(https://fonts.googleapis.com/css?family=Open+Sans:400,700);
    </style>
  </head>
  <body
    class=""
    style="
      font-size: 16px;
      color: #2f2936;
      padding: 0;
      font-family: 'Lato', 'Helvetica Neue', helvetica, sans-serif;
      background-image: url(https://codeb.online/assets/svg/binary_numbers.svg)
        #fff;
      -webkit-font-smoothing: antialiased;
      width: 100%;
      font-weight: 300;
      margin: 0;
      background-color: #fff;
    "
  >
    <div
      class="preheader"
      style="
        padding: 0;
        font-size: 0;
        display: none;
        max-height: 0;
        font-weight: 300;
        mso-hide: all;
        line-height: 0;
      "
    ></div>
    <table
      class="main"
      style="
        border-radius: 10px;
        font-size: 16px;
        color: #2f2936;
        border-collapse: separate;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        border-spacing: 0;
        max-width: 700px;
        font-family: 'Lato', 'Helvetica Neue', helvetica, sans-serif;
        border: 1px solid #c7d0d4;
        padding: 0;
        -webkit-font-smoothing: antialiased;
        width: 100%;
        font-weight: 300;
        margin: 15px auto;
        background-color: #fff;
      "
    >
      <tr style="font-weight: 300">
        <td style="padding: 0; font-weight: 300; margin: 0; text-align: center">
          <div
            class="header"
            style="
              padding: 15px 0;
              font-size: 14px;
              font-weight: 300;
              border-bottom: 1px solid #dee7eb;
            "
          >
            <div
              class="container"
              style="
                padding: 0 20px;
                max-width: 600px;
                font-weight: 300;
                text-align: left;
              "
            >
              <img
                src="https://algo-user-images.s3.us-east-2.amazonaws.com/organization/ALGO.jpg"
                width="120px"
                height="auto"
                alt="algo"
              />
            </div>
          </div>
        </td>
      </tr>
      <tr style="font-weight: 300">
        <td style="padding: 0; font-weight: 300; margin: 0; text-align: center">
          <div
            class="container"
            style="
              padding: 0 20px;
              max-width: 600px;
              font-weight: 300;
              text-align: left;
            "
          >
            <div
              class="inner"
              style="
                padding: 30px 0 20px;
                font-weight: 300;
                background-color: #fff;
              "
            >
              <h3 style="font-size: 18px; font-weight: 700; margin: 0 0 20px">
                Algo Coding Invitation
              </h3>
              <p
                style="
                  font-weight: 300;
                  margin: 0 0 15px;
                  font-size: 16px;
                  line-height: 24px;
                "
              >
                ${text}
              </p>
              <p
                style="
                  font-weight: 300;
                  margin: 0 0 15px;
                  font-size: 16px;
                  line-height: 24px;
                  text-align: center;
                "
              >
                <a
                  href="${link}"
                  class="btn"
                  style="
                    color: #fff;
                    cursor: pointer;
                    border-radius: 50rem;
                    background-color: #00bcd4;
                    border-color: #00bcd4;
                    font-weight: 400;
                    line-height: 1.5;
                    text-align: center;
                    text-decoration: none;
                    vertical-align: middle;
                    padding: 0.5rem 1.5rem;
                    font-size: 1rem;
                  "
                  >Give Test</a
                >
              </p>
            </div>
          </div>
        </td>
      </tr>
    </table>
  </body>
</html>
`;
  }
  return logoTemplate;
}

export async function sendMail(
  mailOptions: mailOptions,
  link: string = undefined,
  logoURl: string = undefined,
) {
  if (link && link.trim() != '') {
    mailOptions.html = invitationHTML(link, mailOptions.text, logoURl);
  }
  if (mailOptions.cc && !mailOptions.cc.length) {
    delete mailOptions.cc;
  }
  if (mailOptions.bcc && !mailOptions.bcc.length) {
    delete mailOptions.bcc;
  }

  // Send Mail

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('Error in senMail1 function', error);
      return error;
      //  throw new Error(error.message);
    }

    return info;
  });
}

export const validateTestCase = (dataType, data) => {
  try {
    let isValid = false;

    switch (dataType) {
      case '2d_array_int':
        // Check if each element is an array of numbers
        isValid =
          Array.isArray(data) && // Check if it's an array
          data.every((subArray) => {
            return (
              Array.isArray(subArray) &&
              subArray.every((elem) => typeof elem === 'number')
            );
          });
        break;

      case '2d_array_char':
        // Check if each element is an array of single characters
        isValid =
          Array.isArray(data) && // Check if it's an array
          data.every((subArray) => {
            return (
              Array.isArray(subArray) &&
              subArray.every(
                (elem) => typeof elem === 'string' && elem.length === 1,
              )
            );
          });
        break;
      case 'array_char':
        // check if any elem is not a number
        isValid =
          Array.isArray(data) &&
          data.length &&
          data.some((d) => d.length === 1 && isNaN(d));
        break;
      case 'array_int':
        // check if any elem is a number
        isValid = Array.isArray(data) && data.length && !data.some(isNaN);
        break;
      case 'int':
        isValid = typeof data === 'number';
        break;
      case 'boolean':
        isValid = typeof data === 'boolean';
        break;
      case 'string':
        isValid = typeof data === 'string';
        break;
      case 'float':
        isValid = typeof data === 'number';
        break;
      default:
        break;
    }

    return isValid;
  } catch (error) {
    return false;
  }
};

export const checkTestCases = (body) => {
  try {
    //Validate the test cases of the question
    let isValid = true;
    for (let i = 0; i < body.testCases.length; i++) {
      let inputValues = JSON.parse(body.testCases[i].input);
      let outputValue = JSON.parse(body.testCases[i].output);

      //Validate each of the input values is of the data type specified.
      for (let j = 0; j < inputValues.length; j++) {
        if (
          !body.inputType[j]?.type ||
          !validateTestCase(body.inputType[j].type, inputValues[j])
        ) {
          isValid = false;
          break;
        }
      }

      if (inputValues.length <= 0) isValid = false;

      isValid = isValid && validateTestCase(body.outputType, outputValue);
      if (!isValid) {
        body = {
          message: 'Invalid test case',
          statusCode: 400,
          data: { failedcaseIndex: i },
        };
        break;
      }
      body.testCases[i].input = inputValues;
      body.testCases[i].output = outputValue;
    }
    return [isValid, body];
  } catch (error) {
    throw new BadRequestException(error.message);
  }
};

export function getDatatypeOfParamters(language: string, paramType: string) {
  let dataType = '';
  if (language === 'java') {
    dataType =
      paramType === '2d_array_int'
        ? 'int[][]'
        : paramType === 'array_int'
        ? 'int[]'
        : paramType === '2d_array_char'
        ? 'char[][]'
        : paramType === 'array_char'
        ? 'char[]'
        : paramType === 'string'
        ? 'String'
        : paramType === 'float'
        ? 'float'
        : paramType;
  } else if (language === 'cpp') {
    dataType =
      paramType === '2d_array_int'
        ? 'vector<vector<int>>'
        : paramType === 'array_int'
        ? 'vector<int>'
        : paramType === '2d_array_char'
        ? 'vector<vector<char>>'
        : paramType === 'array_char'
        ? 'vector<char>'
        : paramType === 'boolean'
        ? 'bool'
        : paramType === 'string'
        ? 'string'
        : paramType === 'float'
        ? 'float'
        : paramType;
  } else if (language === 'go') {
    dataType =
      paramType === '2d_array_int'
        ? '[][]int'
        : paramType === 'array_int'
        ? '[]int'
        : paramType === '2d_array_char'
        ? '[][]rune'
        : paramType === 'array_char'
        ? '[]rune'
        : paramType === 'boolean'
        ? 'bool'
        : paramType === 'string'
        ? 'string'
        : paramType === 'float'
        ? 'float64'
        : paramType;
  }
  return dataType;
}
