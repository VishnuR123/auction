import { Modal } from "antd";

export function showImportResult(data, entityLabel) {
  const summary = `Sheet: ${data.sheet}\nImported: ${data.imported}\nFailed: ${data.failed}${
    data.errorsTruncated ? "\n(Only first 50 errors shown)" : ""
  }`;
  const errText =
    data.errors?.length > 0 ? JSON.stringify(data.errors, null, 2) : "";

  if (data.failed > 0) {
    Modal.warning({
      title: `${entityLabel} import finished with errors`,
      width: 640,
      content: (
        <div>
          <pre
            style={{
              whiteSpace: "pre-wrap",
              marginBottom: 12,
              fontSize: 13,
            }}
          >
            {summary}
          </pre>
          {errText ? (
            <pre
              style={{
                maxHeight: 280,
                overflow: "auto",
                fontSize: 12,
                margin: 0,
              }}
            >
              {errText}
            </pre>
          ) : null}
        </div>
      ),
    });
  } else {
    Modal.success({
      title: `${entityLabel} import`,
      content: (
        <pre style={{ whiteSpace: "pre-wrap", margin: 0, fontSize: 13 }}>
          {summary}
        </pre>
      ),
    });
  }
}
