import type { TFunction } from 'i18next'

import cfg from '@/config'

const generateConfirmEmail = (data: {
  client: string
  link: string
  t: TFunction
}) => {
  const { t } = data

  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="x-ua-compatible" content="ie=edge" />
    <title>${t('email.confirmation.title')}</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />

    <style type="text/css">
      body,
      table,
      td,
      a {
        -ms-text-size-adjust: 100%;
        -webkit-text-size-adjust: 100%;
        font-family: Arial, Helvetica, sans-serif;
      }

      table,
      td {
        mso-table-rspace: 0pt;
        mso-table-lspace: 0pt;
      }

      img {
        -ms-interpolation-mode: bicubic;
        height: auto;
        line-height: 100%;
        text-decoration: none;
        border: 0;
        outline: none;
      }

      body {
        width: 100% !important;
        height: 100% !important;
        padding: 0 !important;
        margin: 0 !important;
        background-color: #e8eaf6;
      }

      table {
        border-collapse: collapse !important;
      }

      a {
        color: #3f51b5;
      }

      a[x-apple-data-detectors] {
        font-family: inherit !important;
        font-size: inherit !important;
        font-weight: inherit !important;
        line-height: inherit !important;
        color: inherit !important;
        text-decoration: none !important;
      }

      div[style*='margin: 16px 0;'] {
        margin: 0 !important;
      }
    </style>
  </head>

  <body>
    <table
      border="0"
      cellpadding="0"
      cellspacing="0"
      width="100%"
      style="background-color: #e8eaf6"
    >
      <tr>
        <td align="center">
          <table
            border="0"
            cellpadding="0"
            cellspacing="0"
            width="100%"
            style="max-width: 600px"
          >
            <!-- Logo -->
            <tr>
              <td
                align="center"
                style="padding: 40px 24px 32px"
              >
                <a
                  href="${data.client}"
                  target="_blank"
                  style="display: inline-block"
                >
                  <img
                    src="${data.client}/icon-splash.png"
                    alt="${cfg.APP_NAME}"
                    width="160"
                  />
                </a>
              </td>
            </tr>

            <!-- Content -->
            <tr>
              <td
                bgcolor="#ffffff"
                style="
                  padding: 40px 32px;
                  border-radius: 12px;
                "
              >
                <h1
                  style="
                    margin: 0 0 24px;
                    color: #1a237e;
                    font-size: 28px;
                    line-height: 36px;
                    font-weight: 700;
                  "
                >
                  ${t('email.confirmation.title')}
                </h1>

                <p
                  style="
                    margin: 0 0 28px;
                    color: #424242;
                    font-size: 16px;
                    line-height: 26px;
                  "
                >
                  ${t('email.confirmation.description')}
                </p>

                <!-- Button -->
                <table
                  border="0"
                  cellpadding="0"
                  cellspacing="0"
                  width="100%"
                >
                  <tr>
                    <td align="center">
                      <table
                        border="0"
                        cellpadding="0"
                        cellspacing="0"
                      >
                        <tr>
                          <td
                            align="center"
                            bgcolor="#3f51b5"
                            style="border-radius: 6px"
                          >
                            <a
                              href="${data.link}"
                              target="_blank"
                              style="
                                display: inline-block;
                                padding: 15px 28px;
                                color: #ffffff;
                                font-size: 16px;
                                line-height: 20px;
                                font-weight: 700;
                                text-decoration: none;
                                border-radius: 6px;
                              "
                            >
                              ${t('email.confirmation.confirm')}
                            </a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>

                <!-- Fallback link -->
                <p
                  style="
                    margin: 32px 0 8px;
                    color: #616161;
                    font-size: 13px;
                    line-height: 20px;
                  "
                >
                  ${t('email.confirmation.fallback')}
                </p>

                <p
                  style="
                    margin: 0;
                    padding: 12px;
                    background-color: #f5f5f5;
                    border-radius: 6px;
                    word-break: break-all;
                    font-size: 13px;
                    line-height: 20px;
                  "
                >
                  <a
                    href="${data.link}"
                    target="_blank"
                    style="color: #3f51b5"
                  >
                    ${data.link}
                  </a>
                </p>

                <p
                  style="
                    margin: 28px 0 0;
                    color: #757575;
                    font-size: 13px;
                    line-height: 20px;
                  "
                >
                  ${t('email.confirmation.ignore')}
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td
                align="center"
                style="
                  padding: 24px;
                  color: #757575;
                  font-size: 12px;
                  line-height: 18px;
                "
              >
                © ${cfg.APP_NAME}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`
}

export default generateConfirmEmail
