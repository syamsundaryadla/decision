const fs = require('fs');
const path = require('path');

const json = {
  "type": "service_account",
  "project_id": "decision-2bb2c",
  "private_key_id": "6ed27b59a54ed2daf649d2c489ae6791c8ed8919",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCpkXTnhuB383V/\na/UXPlBLISfqYzx8SaJe1fsajAbCdIAPRoXK/C/Bhc1pTaHmIe/6dqIjM4G49N3A\nAq+VjK0zfkTrP17KWtD7ipFF9ZGk9vzzgRrumjb3uitOBlSuzMNuBZRmfh1yiFTl\nIDVF/gF/uoFp3F6Jk6VGIbFW9ClYRtaA3et7qBfmox1s6bA5otUXkJhgwDYHepao\nMDV0QUSRCdSTyLgzDBhZjYpQfhYcQnbG6Xt1hYKPnkx7j2OWfxWF2bTE09KnlUdn\ng1nDnbN9thHF44Jre8a4NVxIoNQN9xU13YiW4EW7qb7RjP6KsMmxy40ftLx5BRbv\nNRVfYWeJAgMBAAECggEAFlCSil95DcAHv+eEnvTv2xs3ZgR+Mrr797AANgukXhW3\nvorg04ghfr2tfQSe4CqqKpNPHgPKt/zda8XOtocHSgX9atnxjv6pjti66nJ5IrTw\nL9lXInw/7JTe2wtBPKmstD9euqgxFt/zEB4PdLELIHR6UGSUOlWoQ9TuQguqnzeo\nbwQYIMxghAQsYRFw2RmG4qAwCpIC4pp9esEtHSgTOukCaRD4xlg7Chh1nERinyDk\nf65C92WHI4wMPYo7jjuPaU7c+O8+vNVvKjBM5k0m9bkBVlF6Mvizd0serKw6IXB+\nd9Vi1D9st0huWlWD0JcKWHymW1TjQUjlWfgfE2Hp4wKBgQDSElfYVjmXCsN6e+yq\nm2YCZvQrASPljJFEUOfn9/yag4TrirUWPuVNfWQZXMTIUDPAJ9vCj8TILXcz9CIN\n8HToPdS9Ra6YVCWy3kq3GbGMTcVX1J+6Cdk6KODp2ExgHbrxpHzvl/Dcdit+clNe\meH6wwNVoLLjWtM8XlaPO7x+GwKBgQDOpCUgUFLBYLa0929VTPRpfT4eqWLGgryO\nsZ4eqmeW7DFq7O0MsuTAX00GXnLictSPkkCnWaZakJnTkrUXEDJ3lNw3/Rz0vzWU\ndUpLSgfHs37zOIYnNHIbw92znRwESASxrgaQjA4PU3/GrdvlizzBcOl3XAD8GBcm\nZRKs63g7KwKBgFv/doMit9Pi/dq9PNc2eQUiS1ouBKd52QB/IiCfpPuSD3sL4uRc\nJRW7jUPiMbe8D/3eNsrNJZO4/ZQ+HU/Xd4th0LIXOzAw4dWkrjnjwbK9OGiPkGfr\n+jsTPfSLKl+JhZ5ft+tBslUKV1/n94TdhW7JSsOMPet9kjbE5cmSkqjzAoGBALDA\nFIWMTwzbZcxq7Q8AcPseRplBd5ymzRQc90vxpAOi6i40lBrNlf66RY8SEKCDai+Y\nALdkZneGwh0HmuAsWY6RhMBbP35VY0YmATNfEkKN1SPDkHROVuBK7AKrewBqfaFh\nYnoXYhtX566Qncu9Cm3H39rZlnoLPRn5UD0aeE/bAoGBALJy6Z5glfwik5Wn3Tlf\nu99dJLsRzMFDg34KnFrPFdPD2ophoapGn2AAz9bVZJOGoJmpXcAaRYTa5LHjIkvf\n7TVAdOMDgnHLL2AwhazjR3y9IpGWT3ItJDr6y0EYumrplnaT+qOmog0/jIW7qROa\nsf08usUmWGNOHEgaEztes5CP\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-fbsvc@decision-2bb2c.iam.gserviceaccount.com",
  "client_id": "109865862174317879440",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40decision-2bb2c.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
};

const b64 = Buffer.from(JSON.stringify(json)).toString('base64');
console.log(b64);
