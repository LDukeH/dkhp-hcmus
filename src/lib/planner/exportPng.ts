import html2canvas from "html2canvas";

export async function exportNodeAsPng(node: HTMLElement, filename = "thoi-khoa-bieu.png") {
  const canvas = await html2canvas(node, { backgroundColor: "#ffffff", scale: 2 });
  const url = canvas.toDataURL("image/png");
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}
