$(function(){ // on dom ready
  algorithm = "neighbor";
  $('#cy').cytoscape({
    layout: {
      name: 'cose',
      padding: 10
    },
    
    style: cytoscape.stylesheet()
      .selector('node')
        .css({
          'shape': 'circle',
          'opacity':1,
          'text-opacity': 0.9
        })
      .selector('node.leaf')
        .css({
          'shape': 'rectangle',
          'content': 'data(name)',
          'text-valign': 'center',
          'background-color': '#F5A45D',
          'color': '#444'
        })
      .selector(':selected')
        .css({
          'border-width': 3,
          'border-color': '#333'
        })
      .selector('edge')
        .css({
          'opacity': 0.666,
          'line-color': '#EDA1ED',
          'label': 'data(weight)',
        })
      .selector('edge.child')
        .css({
          'target-arrow-shape': 'triangle',
          'line-color': '#F5A45D',
          'target-arrow-color': '#F5A45D'
        })
      .selector('.faded')
        .css({
          'opacity': 0.25,
          'text-opacity': 0.9
        }),

    elements: {
      nodes: [
        { data: { id: 'center', name: 'center',}},
        { data: { id: 'dog', name: 'dog'}, classes: 'leaf' },
        { data: { id: 'bear', name: 'bear', }, classes: 'leaf'},
        { data: { id: 'raccoon', name: 'raccoon', }, classes: 'leaf' },
        { data: { id: 'weasel', name: 'weasel', }, classes: 'leaf' },
        { data: { id: 'seal', name: 'seal',  }, classes: 'leaf' },
        { data: { id: 'sea-lion', name: 'sea lion', }, classes: 'leaf' },
        { data: { id: 'cat', name: 'cat', }, classes: 'leaf' },
        { data: { id: 'monkey', name: 'monkey', }, classes: 'leaf' },
      ],
      edges: [
        { data: { id: 'edgedog', source: 'center', target: 'dog', weight: 0}},
        { data: { id: 'edgebear', source: 'center', target: 'bear', weight: 0}},
        { data: { id: 'edgeraccoon', source: 'center', target: 'raccoon', weight: 0}},
        { data: { id: 'edgeweasel', source: 'center', target: 'weasel', weight: 0}},
        { data: { id: 'edgeseal', source: 'center', target: 'seal', weight: 0}},
        { data: { id: 'edgesea-lion', source: 'center', target: 'sea-lion', weight: 0}},
        { data: { id: 'edgecat', source: 'center', target: 'cat', weight: 0}},
        { data: { id: 'edgemonkey', source: 'center', target: 'monkey', weight: 0}}

      ]
    },
    
    ready: function(){
      window.cy = this;
      updateTable();
      $("#upgmaexplain").hide();
      cy.on('tap', choose);
    },
    
  });
  
}); // on dom ready

distances = {'dog bear': 32, 'dog raccoon' : 48, 'dog weasel': 51, 'dog seal': 50, 
'dog sea-lion': 48, 'dog cat': 98, 'dog monkey': 148,
'bear raccoon': 26, 'bear weasel': 34, 'bear seal': 29,'bear sea-lion': 33,
'bear cat': 84,'bear monkey': 136,'raccoon weasel': 42,'raccoon seal': 44,
'raccoon sea-lion':44,'raccoon cat':92,'raccoon monkey': 152,'weasel seal':44, 
'weasel sea-lion':38, 'weasel cat':86, 'weasel monkey':142,'seal sea-lion': 24, 
'seal cat':89, 'seal monkey':142,'sea-lion cat': 90,'sea-lion monkey': 142,
'cat monkey':148};
clusters = ['dog','bear','raccoon', 'weasel', 'seal', 'sea-lion','cat','monkey'];

function new_dist(clusters, distances){
  var ri = {};
  for (var cluster in clusters){
    var ri_val = 0;
    for (var pair in distances){
      if (pair.indexOf(clusters[cluster]) != -1){
        ri_val = ri_val + distances[pair]
      }
    }
    ri_val = ri_val * (1/(clusters.length - 2))
    ri[clusters[cluster]] = ri_val;
  }

  Qij = {};
  for (var c1 in clusters){
    for(var c2 in clusters){
      if (c1 != c2){
        var dij = 0;
        if (distances[clusters[c1] + ' ' + clusters[c2]] != undefined){
          dij = distances[clusters[c1] + ' ' + clusters[c2]];
        } else{
          dij = distances[clusters[c2] + ' ' + clusters[c1]];
        }
        Qij[clusters[c1] + ' ' + clusters[c2]] = dij - ri[clusters[c1]] - ri[clusters[c2]];
      }
    }
  }
  var minQ = 1000;
  var minPair;
  for (var pair in Qij){
    if (Qij[pair] < minQ){
      minQ = Qij[pair];
      minPair = pair;
    }
  }
  var node1 = minPair.split(" ")[0];
  var node2 = minPair.split(" ")[1];
  k = node1 + "-" + node2;
  for (var cluster in clusters){
    if (clusters[cluster] != node1 || clusters[cluster] != node2) {
      var dim; 
      var dij;
      var djm;
      var ijpair;
      if (distances[clusters[cluster] + " " + node1] != undefined){
        dim = distances[clusters[cluster] + " " + node1];
      } else{
        dim = distances[node1 + " " + clusters[cluster]];
      }
      if (distances[clusters[cluster] + " " + node2] != undefined){
        djm = distances[clusters[cluster] + " " + node2];
      } else{
        djm = distances[node2 + " " + clusters[cluster]];
      }
      if (distances[node1 + " " + node2] != undefined){
        dij = distances[node1 + " " + node2];
        ijpair = node1 + " " + node2;
      } else{
        dij = distances[node2 + " " + node1];
        ijpair = node2 + " " + node1;
      }
      var newdist = 0.5 * (dim + djm - dij);
      if (newdist){
        distances[k + " " + clusters[cluster]] = newdist;        
      }
    }
  }
  var dik;
  var djk;
  dik = 0.5 * (dij + ri[node1] - ri[node2]);
  djk = dij - dik;
  var new_clusters = [];
  new_clusters.push(k);
  var new_distances = {};
  for (cluster in clusters){
    if (clusters[cluster] != node1 && clusters[cluster] != node2){
      new_clusters.push(clusters[cluster]);
    }
  }
  for (pair in distances){
    var nodes = pair.split(" ");
    if ((nodes.indexOf(node1) == -1 && nodes.indexOf(node2) == -1) || nodes.indexOf(k) != -1){
      new_distances[pair] = distances[pair];
    }
  }
  return {clusters: new_clusters, distances:new_distances, newnode: k, node1: node1, node2: node2, dik: dik, djk: djk};
}

function step(clusters, distances){
  var info = new_dist(clusters, distances);
  cy.remove("#edge" + info["node1"]);
  cy.remove("#edge" + info["node2"]);
  cy.add([
  { group: "nodes", data: { id: info["newnode"] }, },
  { group: "edges", data: { id: "edge" + info["newnode"], source: "center", target: info["newnode"] } },
  { group: "edges", data: { id: "edge" + info["node1"], source: info["newnode"], target: info["node1"], weight: Number((info["dik"]).toFixed(3)) } },
  { group: "edges", data: { id: "edge" + info["node2"], source: info["newnode"], target: info["node2"], weight: Number((info["djk"]).toFixed(3)) } },
  ]);
  return {clusters: info["clusters"], distances: info["distances"]};
}

choose = function(e){
  if (algorithm == "neighbor") {
    neighborjoin(e);
  } else {
    upgma(e);
  }
}

neighborjoin = function(e){
  if (clusters.length <= 2){
    var last = Object.keys(distances);
    var node;
    var other;
    var splat = last[0].split(" ")
    if (splat[0].length <= splat[1].length) {
      node = splat[0];
      other = splat[1];
    } else {
      node = splat[1];
      other = splat[0];
    }
    cy.remove("#center");
    cy.add([
    { group: "edges", data: { id: "edge" + node, source: node, target: other, weight: Number((distances[last]).toFixed(3)) } },
    ]);
  } else {
    x = step(clusters, distances);
    clusters = x['clusters'];
    distances = x['distances'];
    cy.layout({name: "cose"});
  }
  updateTable();

};

upgma = function(e){
  if (clusters.length <= 2){
    var last = Object.keys(distances);
    var node;
    var other;
    var splat = last[0].split(" ")
    if (splat[0].length <= splat[1].length) {
      node = splat[0];
      other = splat[1];
    } else {
      node = splat[1];
      other = splat[0];
    }
    cy.remove("#center");
    cy.add([
    { group: "edges", data: { id: "edge" + node, source: node, target: other, weight: Number((distances[last]/2).toFixed(3)) } },
    ]);
  } else {
    x = upgma_step(clusters, distances);
    clusters = x['clusters'];
    distances = x['distances']
    cy.layout({name: "cose"});
  }
  updateTable();

};

function pair(clusters, distances){
  var lowest = -1
  var pair;
  for (var key in distances){
    if (distances[key] < lowest || lowest < 0){
      lowest = distances[key];
      pair = key;
    }
  }
  var node1 = pair.split(" ")[0];
  var node2 = pair.split(" ")[1];
  var k = node1 + '1' + node2;
  var t1;
  var t2;
  for (var cl in clusters){
    if (clusters[cl] != node1 && clusters[cl] != node2){
      if (distances[node1 + " " + clusters[cl]]){
        t1 = node1.split("1").length * distances[node1 + " " + clusters[cl]];
      } else {
        t1 = node1.split("1").length * distances[clusters[cl] + " " + node1];
      }
      if (distances[node2 + " " + clusters[cl]]){
        t2 = node2.split("1").length * distances[node2 + " " + clusters[cl]];
      } else {
        t2 = node2.split("1").length * distances[clusters[cl] + " " + node2];
      }
      var newsize = node1.split("1").length + node2.split("1").length;
      var newdist = (t1 + t2) / newsize;
      distances[k + " " + clusters[cl]] = newdist;
    }
  }
  var new_clusters = [];
  new_clusters.push(k);
  var new_distances = {};
  for (cluster in clusters){
    if (clusters[cluster] != node1 && clusters[cluster] != node2){
      new_clusters.push(clusters[cluster]);
    }
  }
  for (pair in distances){
    var nodes = pair.split(" ");
    if ((nodes.indexOf(node1) == -1 && nodes.indexOf(node2) == -1) || nodes.indexOf(k) != -1){
      new_distances[pair] = distances[pair];
    }
  }
  return {clusters: new_clusters, distances: new_distances, newnode: k, node1: node1, node2: node2, dist: lowest/2};
}

function upgma_step(clusters, distances){
  var info = pair(clusters, distances);
  var node1length;
  var node2length;
  var lst = cy.$("#" + info["node1"]).connectedEdges();
  for(var i = 0; i < lst.length; i ++){
    if (lst[i].attr('weight') != undefined){
      node1length = lst[i].attr('weight');
    }
  }
  var lst = cy.$("#" + info["node2"]).connectedEdges();
  for(var i = 0; i < lst.length; i ++){
    if (lst[i].attr('weight') != undefined){
      node2length = lst[i].attr('weight');
    }
  }
  cy.remove("#edge" + info["node1"]);
  cy.remove("#edge" + info["node2"]);
  cy.add([
  { group: "nodes", data: { id: info["newnode"] }, },
  { group: "edges", data: { id: "edge" + info["newnode"], source: "center", target: info["newnode"] } },
  { group: "edges", data: { id: "edge" + info["node1"], source: info["newnode"], target: info["node1"], weight: Number((info["dist"] - node1length).toFixed(3)) } },
  { group: "edges", data: { id: "edge" + info["node2"], source: info["newnode"], target: info["node2"], weight: Number((info["dist"] - node2length).toFixed(3)) } },
  ]);
  return {clusters: info["clusters"], distances: info["distances"]};
}

function beginNeighborJoining(){
  reset();
  algorithm = "neighbor";
  $("#upgmaexplain").hide();
  $("#njexplain").show();
  cy.on('tap', neighborjoin);
}
function beginUPGMA(){
  algorithm = "upgma";
  reset();
  $("#upgmaexplain").show();
  $("#njexplain").hide();
  cy.on('tap', upgma);
};

function reset(){
  distances = {'dog bear': 32, 'dog raccoon' : 48, 'dog weasel': 51, 'dog seal': 50, 
  'dog sea-lion': 48, 'dog cat': 98, 'dog monkey': 148,
  'bear raccoon': 26, 'bear weasel': 34, 'bear seal': 29,'bear sea-lion': 33,
  'bear cat': 84,'bear monkey': 136,'raccoon weasel': 42,'raccoon seal': 44,
  'raccoon sea-lion':44,'raccoon cat':92,'raccoon monkey': 152,'weasel seal':44, 
  'weasel sea-lion':38, 'weasel cat':86, 'weasel monkey':142,'seal sea-lion': 24, 
  'seal cat':89, 'seal monkey':142,'sea-lion cat': 90,'sea-lion monkey': 142,
  'cat monkey':148};
  clusters = ['dog','bear','raccoon', 'weasel', 'seal', 'sea-lion','cat','monkey'];
  cy.unbind();
  updateTable();

  cy.remove(cy.elements("node"));

  cy.add([
    { group: "nodes", data: { id: 'center', name: 'center',}},
    { group: "nodes", data: { id: 'dog', name: 'dog'}, classes: 'leaf' },
    { group: "nodes", data: { id: 'bear', name: 'bear', }, classes: 'leaf'},
    { group: "nodes", data: { id: 'raccoon', name: 'raccoon', }, classes: 'leaf' },
    { group: "nodes", data: { id: 'weasel', name: 'weasel', }, classes: 'leaf' },
    { group: "nodes", data: { id: 'seal', name: 'seal',  }, classes: 'leaf' },
    { group: "nodes", data: { id: 'sea-lion', name: 'sea lion', }, classes: 'leaf' },
    { group: "nodes", data: { id: 'cat', name: 'cat', }, classes: 'leaf' },
    { group: "nodes", data: { id: 'monkey', name: 'monkey', }, classes: 'leaf' },
    { group: "edges", data: { id: 'edgedog', source: 'center', target: 'dog', weight: 0}},
    { group: "edges", data: { id: 'edgebear', source: 'center', target: 'bear', weight: 0}},
    { group: "edges", data: { id: 'edgeraccoon', source: 'center', target: 'raccoon', weight: 0}},
    { group: "edges", data: { id: 'edgeweasel', source: 'center', target: 'weasel', weight: 0}},
    { group: "edges", data: { id: 'edgeseal', source: 'center', target: 'seal', weight: 0}},
    { group: "edges", data: { id: 'edgesea-lion', source: 'center', target: 'sea-lion', weight: 0}},
    { group: "edges", data: { id: 'edgecat', source: 'center', target: 'cat', weight: 0}},
    { group: "edges", data: { id: 'edgemonkey', source: 'center', target: 'monkey', weight: 0}}

  ]);
  cy.layout({name: "cose"});
}


function updateTable(){
  $("#disttable tbody tr").remove(); 
  for(var idx in distances){
    var first = idx.split(" ")[0];
    var second = idx.split(" ")[1];
    $("#disttable").append("<tr><td>"+first.replace(/1/g,' ').replace(/-/g,' ')+"</td><td>"+second.replace(/1/g,' ').replace(/-/g,' ')+"</td><td>"+Number((distances[idx]).toFixed(3))+"</td></tr>");
  }
}
