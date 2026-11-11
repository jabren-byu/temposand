/* Tempo smoke test. One small script shared by every page. */
(function () {
  // SETTINGS -------------------------------------------------------------
  // Paste a Google Form link here for remote testers. With it set, the
  // unavailable page links to the form. With it empty, the page shows the
  // questions and saves answers in the visitor's own browser (see results.html).
  var FORM_URL = "";
  // ---------------------------------------------------------------------

  var page = document.body.getAttribute("data-page");
  var $ = function (id) { return document.getElementById(id); };
  var mem = [];

  function load() {
    try { var v = JSON.parse(localStorage.getItem("recessLog") || "[]"); return Array.isArray(v) ? v : mem; }
    catch (e) { return mem; }
  }
  function save(a) { mem = a; try { localStorage.setItem("recessLog", JSON.stringify(a)); } catch (e) {} }
  function log(type, extra) { var a = load(); a.push(Object.assign({ t: Date.now(), type: type }, extra || {})); save(a); }

  var h = document.querySelector("[data-focus]");
  if (h && page !== "home") h.focus({ preventScroll: true });

  document.querySelectorAll("[data-cta]").forEach(function (a) {
    a.addEventListener("click", function () { log("click_preorder"); });
  });

  if (page === "home") log("view_landing");

  if (page === "checkout") {
    log("view_checkout");
    $("orderForm").addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = $("name").value.trim() && /^\S+@\S+\.\S+$/.test($("email").value.trim()) && $("role").value;
      $("formErr").hidden = !!ok;
      if (!ok) return;
      try { sessionStorage.setItem("recessRole", $("role").value); } catch (x) {}
      log("place_preorder", { role: $("role").value });
      window.location.href = "unavailable.html";
    });
  }

  if (page === "unavailable") {
    log("view_unavailable");
    var role = "";
    try { role = sessionStorage.getItem("recessRole") || ""; } catch (x) {}
    var sg = $("scoreGroup");
    for (var i = 1; i <= 10; i++) {
      var l = document.createElement("label"), inp = document.createElement("input"), sp = document.createElement("span");
      inp.type = "radio"; inp.name = "score"; inp.value = String(i); sp.textContent = String(i);
      l.appendChild(inp); l.appendChild(sp); sg.appendChild(l);
    }
    if (FORM_URL) {
      $("remote").hidden = false; $("survey").hidden = true;
      $("formLink").href = FORM_URL;
      $("formLink").addEventListener("click", function () { log("click_form"); });
    }
    $("survey").addEventListener("submit", function (e) {
      e.preventDefault();
      var picked = document.querySelector('input[name="score"]:checked');
      if (!picked) { $("thanks").hidden = false; $("thanks").textContent = "Please pick a score from 1 to 10 first."; return; }
      log("survey", { score: parseInt(picked.value, 10), role: role, stop: $("stop").value.trim(), dislike: $("dislike").value.trim() });
      $("thanks").textContent = "Thank you. That helps a lot.";
      $("thanks").hidden = false;
      $("send").disabled = true;
    });
  }

  if (page === "results") {
    var steps = [
      ["view_landing", "Viewed the product page"],
      ["click_preorder", "Clicked Pre-order"],
      ["view_checkout", "Reached checkout"],
      ["place_preorder", "Placed the pre-order"],
      ["view_unavailable", "Saw it was unavailable"],
      ["survey", "Sent answers"]
    ];
    var tally = function () { var a = load(), c = {}; a.forEach(function (x) { c[x.type] = (c[x.type] || 0) + 1; }); return { a: a, c: c }; };
    var summaryText = function () {
      var t = tally(), base = t.c.view_landing || 0, out = [];
      steps.forEach(function (s) { var n = t.c[s[0]] || 0; out.push(s[1] + ": " + n + (base ? " (" + Math.round(100 * n / base) + "%)" : "")); });
      var sv = t.a.filter(function (x) { return x.type === "survey"; });
      if (sv.length) {
        out.push("Average score: " + (sv.reduce(function (n, x) { return n + x.score; }, 0) / sv.length).toFixed(1));
        sv.forEach(function (x, k) { out.push("Answer " + (k + 1) + " (" + (x.role || "no role") + ", " + x.score + "/10) stop: " + (x.stop || "-") + " | dislike: " + (x.dislike || "-")); });
      }
      return out.join("\n");
    };
    var render = function () {
      var t = tally(), base = t.c.view_landing || 0, tb = $("funnel").tBodies[0];
      tb.textContent = "";
      steps.forEach(function (s) {
        var n = t.c[s[0]] || 0, tr = document.createElement("tr");
        [s[1], String(n), base ? Math.round(100 * n / base) + "%" : "-"].forEach(function (v) { var td = document.createElement("td"); td.textContent = v; tr.appendChild(td); });
        tb.appendChild(tr);
      });
      var ul = $("answers"); ul.textContent = "";
      var sv = t.a.filter(function (x) { return x.type === "survey"; });
      if (!sv.length) { var li0 = document.createElement("li"); li0.textContent = "No answers saved in this browser yet."; ul.appendChild(li0); }
      sv.forEach(function (x) {
        var li = document.createElement("li");
        li.textContent = x.score + "/10, " + (x.role || "no role given") + ". Would stop them: " + (x.stop || "-") + ". Dislike: " + (x.dislike || "-");
        ul.appendChild(li);
      });
    };
    render();
    $("copyLog").addEventListener("click", function () {
      var done = function () { $("logMsg").textContent = "Copied."; };
      var fail = function () { $("logMsg").textContent = "Copy was blocked. Select the table and copy it by hand."; };
      if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(summaryText()).then(done, fail); } else { fail(); }
    });
    var armed = false;
    $("clearLog").addEventListener("click", function () {
      if (!armed) { armed = true; $("clearLog").textContent = "Click again to clear"; return; }
      armed = false; $("clearLog").textContent = "Clear log"; save([]); render(); $("logMsg").textContent = "Log cleared.";
    });
  }
})();
