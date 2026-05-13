'use strict';

import Shell from 'gi://Shell';
import GLib from 'gi://GLib';
import GObject from 'gi://GObject';
import Clutter from 'gi://Clutter';

const getCornerShaderSource = (extensionDir) => {
  const SHADER_PATH = GLib.build_filenamev([
    extensionDir,
    'effects',
    'corner_effect.glsl',
  ]);

  try {
    return Shell.get_file_contents_utf8_sync(SHADER_PATH);
  } catch (e) {
    log(`[d2dl] error loading shader from ${SHADER_PATH}: ${e}`);
    return null;
  }
};

export const CornerEffect = GObject.registerClass(
  {},
  class D2DACornerEffect extends Clutter.ShaderEffect {
    _init(params = {}) {
      this._radius = 0;
      this._smoothing = 0;
      this._width = 0;
      this._height = 0;

      let extensionDir = params.extensionDir;
      delete params.extensionDir;

      super._init(params);

      if (extensionDir) {
        this.preload(extensionDir);
      }
    }

    preload(path) {
      this._source = getCornerShaderSource(path);
      if (this._source) {
        this.set_shader_source(this._source);
      }
      this.update_enabled();
    }

    set radius(value) {
      this._radius = value || 0;
      this.set_uniform_value('radius', parseFloat(this._radius));
      this.update_enabled();
    }

    set smoothing(value) {
      this._smoothing = value || 0;
      this.set_uniform_value('smoothing', parseFloat(this._smoothing));
      this.update_enabled();
    }

    set size(value) {
      this._width = value[0] || 0;
      this._height = value[1] || 0;
      this.set_uniform_value('width', parseFloat(this._width));
      this.set_uniform_value('height', parseFloat(this._height));
      this.update_enabled();
    }

    update({ radius, smoothing, width, height }) {
      this.radius = radius;
      this.smoothing = smoothing;
      this.size = [width, height];
    }

    update_enabled() {
      this.set_enabled(
        this._radius > 0 &&
          this._smoothing > 0 &&
          this._width > 0 &&
          this._height > 0
      );
    }

    vfunc_paint_target(paint_node = null, paint_context = null) {
      this.set_uniform_value('tex', 0);

      if (paint_node && paint_context)
        super.vfunc_paint_target(paint_node, paint_context);
      else if (paint_node) super.vfunc_paint_target(paint_node);
      else super.vfunc_paint_target();
    }
  }
);
