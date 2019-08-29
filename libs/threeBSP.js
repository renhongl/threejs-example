(function() {
    var BACK, COPLANAR, EPSILON, FRONT, SPANNING, Timelimit, returning,
      __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
      __slice = [].slice,
      __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
      __hasProp = {}.hasOwnProperty;
  
    EPSILON = 1e-5;
  
    COPLANAR = 0;
  
    FRONT = 1;
  
    BACK = 2;
  
    SPANNING = 3;
  
    returning = function(value, fn) {
      fn();
      return value;
    };
  
    Timelimit = (function() {
      function Timelimit(_at_timeout, _at_progress) {
        this.timeout = _at_timeout;
        this.progress = _at_progress;
        this.doTask = __bind(this.doTask, this);
        this.finish = __bind(this.finish, this);
        this.start = __bind(this.start, this);
        this.check = __bind(this.check, this);
        "NOTHING";
      }
  
      Timelimit.prototype.check = function() {
        var elapsed;
        if (this.started == null) {
          return;
        }
        return returning((elapsed = Date.now() - this.started), (function(_this) {
          return function() {
            var _ref, _ref1, _ref2;
            if ((_ref = elapsed >= _this.timeout) != null ? _ref : Infinity) {
              throw new Error("Timeout reached: " + elapsed + "/" + _this.timeout + ", " + ((_ref1 = _this.tasks) != null ? _ref1 : 0) + " tasks unfinished " + ((_ref2 = _this.done) != null ? _ref2 : 0) + " finished.");
            }
          };
        })(this));
      };
  
      Timelimit.prototype.start = function() {
        if (this.started == null) {
          this.started = Date.now();
        }
        if (this.tasks == null) {
          this.tasks = 0;
        }
        if (this.total == null) {
          this.total = 0;
        }
        this.total += 1;
        this.tasks += 1;
        return this.check();
      };
  
      Timelimit.prototype.finish = function() {
        var elapsed;
        if ((this.tasks != null) && this.tasks < 1) {
          throw new Error("Finished more tasks than started");
        }
        this.tasks -= 1;
        elapsed = this.check();
        if (this.done == null) {
          this.done = 0;
        }
        this.done += 1;
        if (this.progress != null) {
          this.progress(this.done, this.total);
        }
        if (this.tasks === 0) {
          "Finished " + this.done + " tasks in " + elapsed + "/" + this.timeout + " ms";
          return this.started = this.done = this.total = void 0;
        }
      };
  
      Timelimit.prototype.doTask = function(block) {
        var result;
        this.start();
        result = block();
        this.finish();
        return result;
      };
  
      return Timelimit;
  
    })();
  
    window.ThreeBSP = (function() {
      function ThreeBSP(treeIsh, _at_matrix, _at_options) {
        var _base, _ref, _ref1, _ref2, _ref3;
        this.matrix = _at_matrix;
        this.options = _at_options != null ? _at_options : {};
        this.intersect = __bind(this.intersect, this);
        this.union = __bind(this.union, this);
        this.subtract = __bind(this.subtract, this);
        this.toGeometry = __bind(this.toGeometry, this);
        this.toMesh = __bind(this.toMesh, this);
        this.toTree = __bind(this.toTree, this);
        this.withTimer = __bind(this.withTimer, this);
        if ((this.matrix != null) && !(this.matrix instanceof THREE.Matrix4)) {
          this.options = this.matrix;
          this.matrix = void 0;
        }
        if (this.options == null) {
          this.options = {};
        }
        if (this.matrix == null) {
          this.matrix = new THREE.Matrix4();
        }
        if ((_base = this.options).timer == null) {
          _base.timer = new Timelimit((_ref = (_ref1 = this.options.timer) != null ? _ref1.timeout : void 0) != null ? _ref : this.options.timeout, (_ref2 = (_ref3 = this.options.timer) != null ? _ref3.progress : void 0) != null ? _ref2 : this.options.progress);
        }
        this.tree = this.toTree(treeIsh);
      }
  
      ThreeBSP.prototype.withTimer = function(new_timer, block) {
        var old_timer;
        old_timer = this.options.timer;
        try {
          this.options.timer = new_timer;
          return block();
        } finally {
          this.options.timer = old_timer;
        }
      };
  
      ThreeBSP.prototype.toTree = function(treeIsh) {
        var face, geometry, i, polygons, _fn, _i, _len, _ref;
        if (treeIsh instanceof ThreeBSP.Node) {
          return treeIsh;
        }
        polygons = [];
        geometry = treeIsh instanceof THREE.Geometry ? treeIsh : treeIsh instanceof THREE.Mesh ? (treeIsh.updateMatrix(), this.matrix = treeIsh.matrix.clone(), treeIsh.geometry) : void 0;
        _ref = geometry.faces;
        _fn = (function(_this) {
          return function(face, i) {
            var faceVertexUvs, idx, polygon, vIndex, vName, vertex, _j, _len1, _ref1, _ref2;
            faceVertexUvs = (_ref1 = geometry.faceVertexUvs) != null ? _ref1[0][i] : void 0;
            if (faceVertexUvs == null) {
              faceVertexUvs = [new THREE.Vector2(), new THREE.Vector2(), new THREE.Vector2(), new THREE.Vector2()];
            }
            polygon = new ThreeBSP.Polygon();
            _ref2 = ['a', 'b', 'c', 'd'];
            for (vIndex = _j = 0, _len1 = _ref2.length; _j < _len1; vIndex = ++_j) {
              vName = _ref2[vIndex];
              if ((idx = face[vName]) != null) {
                vertex = geometry.vertices[idx];
                vertex = new ThreeBSP.Vertex(vertex.x, vertex.y, vertex.z, face.vertexNormals[0], new THREE.Vector2(faceVertexUvs[vIndex].x, faceVertexUvs[vIndex].y));
                vertex.applyMatrix4(_this.matrix);
                polygon.vertices.push(vertex);
              }
            }
            return polygons.push(polygon.calculateProperties());
          };
        })(this);
        for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
          face = _ref[i];
          _fn(face, i);
        }
        return new ThreeBSP.Node(polygons, this.options);
      };
  
      ThreeBSP.prototype.toMesh = function(material) {
        if (material == null) {
          material = new THREE.MeshNormalMaterial();
        }
        return this.options.timer.doTask((function(_this) {
          return function() {
            var geometry, mesh;
            geometry = _this.toGeometry();
            return returning((mesh = new THREE.Mesh(geometry, material)), function() {
              mesh.position.getPositionFromMatrix(_this.matrix);
              // return mesh.rotation.setEulerFromRotationMatrix(_this.matrix);
            });
          };
        })(this));
      };
  
      ThreeBSP.prototype.toGeometry = function() {
        return this.options.timer.doTask((function(_this) {
          return function() {
            var geometry, matrix;
            matrix = new THREE.Matrix4().getInverse(_this.matrix);
            return returning((geometry = new THREE.Geometry()), function() {
              var polygon, _i, _len, _ref, _results;
              _ref = _this.tree.allPolygons();
              _results = [];
              for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                polygon = _ref[_i];
                _results.push(_this.options.timer.doTask(function() {
                  var face, idx, polyVerts, v, vertUvs, verts, _j, _ref1, _results1;
                  polyVerts = (function() {
                    var _j, _len1, _ref1, _results1;
                    _ref1 = polygon.vertices;
                    _results1 = [];
                    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
                      v = _ref1[_j];
                      _results1.push(v.clone().applyMatrix4(matrix));
                    }
                    return _results1;
                  })();
                  _results1 = [];
                  for (idx = _j = 2, _ref1 = polyVerts.length; 2 <= _ref1 ? _j < _ref1 : _j > _ref1; idx = 2 <= _ref1 ? ++_j : --_j) {
                    verts = [polyVerts[0], polyVerts[idx - 1], polyVerts[idx]];
                    vertUvs = (function() {
                      var _k, _len1, _ref2, _ref3, _results2;
                      _results2 = [];
                      for (_k = 0, _len1 = verts.length; _k < _len1; _k++) {
                        v = verts[_k];
                        _results2.push(new THREE.Vector2((_ref2 = v.uv) != null ? _ref2.x : void 0, (_ref3 = v.uv) != null ? _ref3.y : void 0));
                      }
                      return _results2;
                    })();
                    face = (function(func, args, ctor) {
                      ctor.prototype = func.prototype;
                      var child = new ctor, result = func.apply(child, args);
                      return Object(result) === result ? result : child;
                    })(THREE.Face3, __slice.call((function() {
                      var _k, _len1, _results2;
                      _results2 = [];
                      for (_k = 0, _len1 = verts.length; _k < _len1; _k++) {
                        v = verts[_k];
                        _results2.push(geometry.vertices.push(v) - 1);
                      }
                      return _results2;
                    })()).concat([polygon.normal.clone()]), function(){});
                    geometry.faces.push(face);
                    _results1.push(geometry.faceVertexUvs[0].push(vertUvs));
                  }
                  return _results1;
                }));
              }
              return _results;
            });
          };
        })(this));
      };
  
      ThreeBSP.prototype.subtract = function(other) {
        return this.options.timer.doTask((function(_this) {
          return function() {
            return other.withTimer(_this.options.timer, function() {
              var them, us, _ref;
              _ref = [_this.tree.clone(), other.tree.clone()], us = _ref[0], them = _ref[1];
              us.invert().clipTo(them);
              them.clipTo(us).invert().clipTo(us).invert();
              return new ThreeBSP(us.build(them.allPolygons()).invert(), _this.matrix, _this.options);
            });
          };
        })(this));
      };
  
      ThreeBSP.prototype.union = function(other) {
        return this.options.timer.doTask((function(_this) {
          return function() {
            return other.withTimer(_this.options.timer, function() {
              var them, us, _ref;
              _ref = [_this.tree.clone(), other.tree.clone()], us = _ref[0], them = _ref[1];
              us.clipTo(them);
              them.clipTo(us).invert().clipTo(us).invert();
              return new ThreeBSP(us.build(them.allPolygons()), _this.matrix, _this.options);
            });
          };
        })(this));
      };
  
      ThreeBSP.prototype.intersect = function(other) {
        return this.options.timer.doTask((function(_this) {
          return function() {
            return other.withTimer(_this.options.timer, function() {
              var them, us, _ref;
              _ref = [_this.tree.clone(), other.tree.clone()], us = _ref[0], them = _ref[1];
              them.clipTo(us.invert()).invert().clipTo(us.clipTo(them));
              return new ThreeBSP(us.build(them.allPolygons()).invert(), _this.matrix, _this.options);
            });
          };
        })(this));
      };
  
      return ThreeBSP;
  
    })();
  
    ThreeBSP.Vertex = (function(_super) {
      __extends(Vertex, _super);
  
      function Vertex(x, y, z, _at_normal, _at_uv) {
        this.normal = _at_normal != null ? _at_normal : new THREE.Vector3();
        this.uv = _at_uv != null ? _at_uv : new THREE.Vector2();
        this.interpolate = __bind(this.interpolate, this);
        this.lerp = __bind(this.lerp, this);
        Vertex.__super__.constructor.call(this, x, y, z);
      }
  
      Vertex.prototype.clone = function() {
        return new ThreeBSP.Vertex(this.x, this.y, this.z, this.normal.clone(), this.uv.clone());
      };
  
      Vertex.prototype.lerp = function(v, alpha) {
        return returning(Vertex.__super__.lerp.apply(this, arguments), (function(_this) {
          return function() {
            _this.uv.add(v.uv.clone().sub(_this.uv).multiplyScalar(alpha));
            return _this.normal.lerp(v, alpha);
          };
        })(this));
      };
  
      Vertex.prototype.interpolate = function() {
        var args, _ref;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        return (_ref = this.clone()).lerp.apply(_ref, args);
      };
  
      return Vertex;
  
    })(THREE.Vector3);
  
    ThreeBSP.Polygon = (function() {
      function Polygon(_at_vertices, _at_normal, _at_w) {
        this.vertices = _at_vertices != null ? _at_vertices : [];
        this.normal = _at_normal;
        this.w = _at_w;
        this.subdivide = __bind(this.subdivide, this);
        this.tessellate = __bind(this.tessellate, this);
        this.classifySide = __bind(this.classifySide, this);
        this.classifyVertex = __bind(this.classifyVertex, this);
        this.invert = __bind(this.invert, this);
        this.clone = __bind(this.clone, this);
        this.calculateProperties = __bind(this.calculateProperties, this);
        if (this.vertices.length) {
          this.calculateProperties();
        }
      }
  
      Polygon.prototype.calculateProperties = function() {
        return returning(this, (function(_this) {
          return function() {
            var a, b, c, _ref;
            _ref = _this.vertices, a = _ref[0], b = _ref[1], c = _ref[2];
            _this.normal = b.clone().sub(a).cross(c.clone().sub(a)).normalize();
            return _this.w = _this.normal.clone().dot(a);
          };
        })(this));
      };
  
      Polygon.prototype.clone = function() {
        var v;
        return new ThreeBSP.Polygon((function() {
          var _i, _len, _ref, _results;
          _ref = this.vertices;
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            v = _ref[_i];
            _results.push(v.clone());
          }
          return _results;
        }).call(this), this.normal.clone(), this.w);
      };
  
      Polygon.prototype.invert = function() {
        return returning(this, (function(_this) {
          return function() {
            _this.normal.multiplyScalar(-1);
            _this.w *= -1;
            return _this.vertices.reverse();
          };
        })(this));
      };
  
      Polygon.prototype.classifyVertex = function(vertex) {
        var side;
        side = this.normal.dot(vertex) - this.w;
        switch (false) {
          case !(side < -EPSILON):
            return BACK;
          case !(side > EPSILON):
            return FRONT;
          default:
            return COPLANAR;
        }
      };
  
      Polygon.prototype.classifySide = function(polygon) {
        var back, front, tally, v, _i, _len, _ref, _ref1;
        _ref = [0, 0], front = _ref[0], back = _ref[1];
        tally = (function(_this) {
          return function(v) {
            switch (_this.classifyVertex(v)) {
              case FRONT:
                return front += 1;
              case BACK:
                return back += 1;
            }
          };
        })(this);
        _ref1 = polygon.vertices;
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          v = _ref1[_i];
          tally(v);
        }
        if (front > 0 && back === 0) {
          return FRONT;
        }
        if (front === 0 && back > 0) {
          return BACK;
        }
        if ((front === back && back === 0)) {
          return COPLANAR;
        }
        return SPANNING;
      };
  
      Polygon.prototype.tessellate = function(poly) {
        var b, count, f, i, j, polys, t, ti, tj, v, vi, vj, _i, _len, _ref, _ref1, _ref2;
        _ref = {
          f: [],
          b: [],
          count: poly.vertices.length
        }, f = _ref.f, b = _ref.b, count = _ref.count;
        if (this.classifySide(poly) !== SPANNING) {
          return [poly];
        }
        _ref1 = poly.vertices;
        for (i = _i = 0, _len = _ref1.length; _i < _len; i = ++_i) {
          vi = _ref1[i];
          vj = poly.vertices[(j = (i + 1) % count)];
          _ref2 = (function() {
            var _j, _len1, _ref2, _results;
            _ref2 = [vi, vj];
            _results = [];
            for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
              v = _ref2[_j];
              _results.push(this.classifyVertex(v));
            }
            return _results;
          }).call(this), ti = _ref2[0], tj = _ref2[1];
          if (ti !== BACK) {
            f.push(vi);
          }
          if (ti !== FRONT) {
            b.push(vi);
          }
          if ((ti | tj) === SPANNING) {
            t = (this.w - this.normal.dot(vi)) / this.normal.dot(vj.clone().sub(vi));
            v = vi.interpolate(vj, t);
            f.push(v);
            b.push(v);
          }
        }
        return returning((polys = []), (function(_this) {
          return function() {
            if (f.length >= 3) {
              polys.push(new ThreeBSP.Polygon(f));
            }
            if (b.length >= 3) {
              return polys.push(new ThreeBSP.Polygon(b));
            }
          };
        })(this));
      };
  
      Polygon.prototype.subdivide = function(polygon, coplanar_front, coplanar_back, front, back) {
        var poly, side, _i, _len, _ref, _results;
        _ref = this.tessellate(polygon);
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          poly = _ref[_i];
          side = this.classifySide(poly);
          switch (side) {
            case FRONT:
              _results.push(front.push(poly));
              break;
            case BACK:
              _results.push(back.push(poly));
              break;
            case COPLANAR:
              if (this.normal.dot(poly.normal) > 0) {
                _results.push(coplanar_front.push(poly));
              } else {
                _results.push(coplanar_back.push(poly));
              }
              break;
            default:
              throw new Error("BUG: Polygon of classification " + side + " in subdivision");
          }
        }
        return _results;
      };
  
      return Polygon;
  
    })();
  
    ThreeBSP.Node = (function() {
      Node.prototype.clone = function() {
        var node;
        return returning((node = new ThreeBSP.Node(this.options)), (function(_this) {
          return function() {
            var _ref;
            node.divider = (_ref = _this.divider) != null ? _ref.clone() : void 0;
            node.polygons = _this.options.timer.doTask(function() {
              var p, _i, _len, _ref1, _results;
              _ref1 = _this.polygons;
              _results = [];
              for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
                p = _ref1[_i];
                _results.push(p.clone());
              }
              return _results;
            });
            node.front = _this.options.timer.doTask(function() {
              var _ref1;
              return (_ref1 = _this.front) != null ? _ref1.clone() : void 0;
            });
            return node.back = _this.options.timer.doTask(function() {
              var _ref1;
              return (_ref1 = _this.back) != null ? _ref1.clone() : void 0;
            });
          };
        })(this));
      };
  
      function Node(polygons, _at_options) {
        this.options = _at_options != null ? _at_options : {};
        this.clipTo = __bind(this.clipTo, this);
        this.clipPolygons = __bind(this.clipPolygons, this);
        this.invert = __bind(this.invert, this);
        this.allPolygons = __bind(this.allPolygons, this);
        this.isConvex = __bind(this.isConvex, this);
        this.build = __bind(this.build, this);
        this.clone = __bind(this.clone, this);
        if ((polygons != null) && !(polygons instanceof Array)) {
          this.options = polygons;
          polygons = void 0;
        }
        this.polygons = [];
        this.options.timer.doTask((function(_this) {
          return function() {
            if ((polygons != null) && polygons.length) {
              return _this.build(polygons);
            }
          };
        })(this));
      }
  
      Node.prototype.build = function(polygons) {
        return returning(this, (function(_this) {
          return function() {
            var polys, side, sides, _results;
            sides = {
              front: [],
              back: []
            };
            if (_this.divider == null) {
              _this.divider = polygons[0].clone();
            }
            _this.options.timer.doTask(function() {
              var poly, _i, _len, _results;
              _results = [];
              for (_i = 0, _len = polygons.length; _i < _len; _i++) {
                poly = polygons[_i];
                _results.push(_this.options.timer.doTask(function() {
                  return _this.divider.subdivide(poly, _this.polygons, _this.polygons, sides.front, sides.back);
                }));
              }
              return _results;
            });
            _results = [];
            for (side in sides) {
              if (!__hasProp.call(sides, side)) continue;
              polys = sides[side];
              if (polys.length) {
                if (_this[side] == null) {
                  _this[side] = new ThreeBSP.Node(_this.options);
                }
                _results.push(_this[side].build(polys));
              } else {
                _results.push(void 0);
              }
            }
            return _results;
          };
        })(this));
      };
  
      Node.prototype.isConvex = function(polys) {
        var inner, outer, _i, _j, _len, _len1;
        for (_i = 0, _len = polys.length; _i < _len; _i++) {
          inner = polys[_i];
          for (_j = 0, _len1 = polys.length; _j < _len1; _j++) {
            outer = polys[_j];
            if (inner !== outer && outer.classifySide(inner) !== BACK) {
              return false;
            }
          }
        }
        return true;
      };
  
      Node.prototype.allPolygons = function() {
        return this.options.timer.doTask((function(_this) {
          return function() {
            var _ref, _ref1;
            return _this.polygons.slice().concat(((_ref1 = _this.front) != null ? _ref1.allPolygons() : void 0) || []).concat(((_ref = _this.back) != null ? _ref.allPolygons() : void 0) || []);
          };
        })(this));
      };
  
      Node.prototype.invert = function() {
        return returning(this, (function(_this) {
          return function() {
            return _this.options.timer.doTask(function() {
              var flipper, poly, _i, _j, _len, _len1, _ref, _ref1, _ref2;
              _ref = _this.polygons;
              for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                poly = _ref[_i];
                _this.options.timer.doTask(function() {
                  return poly.invert();
                });
              }
              _ref1 = [_this.divider, _this.front, _this.back];
              for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
                flipper = _ref1[_j];
                _this.options.timer.doTask(function() {
                  return flipper != null ? flipper.invert() : void 0;
                });
              }
              return _ref2 = [_this.back, _this.front], _this.front = _ref2[0], _this.back = _ref2[1], _ref2;
            });
          };
        })(this));
      };
  
      Node.prototype.clipPolygons = function(polygons) {
        return this.options.timer.doTask((function(_this) {
          return function() {
            var back, front, poly, _i, _len;
            if (!_this.divider) {
              return polygons.slice();
            }
            front = [];
            back = [];
            for (_i = 0, _len = polygons.length; _i < _len; _i++) {
              poly = polygons[_i];
              _this.options.timer.doTask(function() {
                return _this.divider.subdivide(poly, front, back, front, back);
              });
            }
            if (_this.front) {
              front = _this.front.clipPolygons(front);
            }
            if (_this.back) {
              back = _this.back.clipPolygons(back);
            }
            if (_this.back) {
              return front.concat(back);
            } else {
              return front;
            }
          };
        })(this));
      };
  
      Node.prototype.clipTo = function(node) {
        return returning(this, (function(_this) {
          return function() {
            return _this.options.timer.doTask(function() {
              var _ref, _ref1;
              _this.polygons = node.clipPolygons(_this.polygons);
              if ((_ref = _this.front) != null) {
                _ref.clipTo(node);
              }
              return (_ref1 = _this.back) != null ? _ref1.clipTo(node) : void 0;
            });
          };
        })(this));
      };
  
      return Node;
  
    })();
  
  }).call(this);