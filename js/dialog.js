/**
 * Reusable confirmation dialog.
 */
function ask(msg, yes, yl, nl) {
  $("mt").innerHTML = msg;
  $("my").textContent = yl;
  $("mn").textContent = nl || "";
  $("mn").style.display = nl ? "" : "none";
  $("md").style.display = "flex";
  const close = () => {
    $("md").style.display = "none";
  };
  $("my").onclick = () => {
    close();
    yes();
  };
  $("mn").onclick = close;
  $("my").focus();
}
