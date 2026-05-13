'use strict';

import Shell from 'gi://Shell';
import GLib from 'gi://GLib';
import GObject from 'gi://GObject';
import Clutter from 'gi://Clutter';

const getShaderSource = (extensionDir) => {
  const SHADER_PATH = GLib.build_filenamev([
    extensionDir,
    'effects',
    'smooth_corners_effect.glsl',
  ]);

  try {
    return Shell.get_file_contents_utf8_sync(SHADER_PATH);
  } catch (e) {
    log(`[d2dl] error loading shader from ${SHADER_PATH}: ${e}`);
    return null;
  }
};

export const SmoothCornersEffect = GObject.registerClass(
  {},
  class D2DASmoothCornersEffect extends Clutter.ShaderEffect {
    _init(params = {}) {
      super._init(params);
      this._width = 0;
      this._height = 0;
      this._radius = 0;
      this._smoothing = 0;
      this._enabled = false;
    }

    preload(path) {
      this._source = getShaderSource(path);
      if (this._source) {
        this.set_shader_source(this._source);
      }
      this.update_enabled();
    }

    update(params = {}) {
      let {
        width = this._width,
        height = this._height,
        radius = this._radius,
        smoothing = this._smoothing,
        enabled = true,
      } = params;

      this._width = Math.max(0, width);
      this._height = Math.max(0, height);
      this._radius = Math.max(0, radius);
      this._smoothing = Math.max(0, Math.min(1, smoothing));

      let exponent = this._smoothing * 10 + 2;
      let clipRadius = this._radius;

      if (this._smoothing > 0 && this._radius > 0) {
        clipRadius = this._radius * 0.5 * exponent;
        let maxRadius = Math.min(this._width, this._height) / 2;
        if (maxRadius > 0) {
          clipRadius = Math.min(clipRadius, maxRadius);
        }
      }

      this.set_uniform_value('actorWidth', this._width - 1e-6);
      this.set_uniform_value('actorHeight', this._height - 1e-6);
      this.set_uniform_value('clipRadius', clipRadius - 1e-6);
      this.set_uniform_value('exponent', exponent - 1e-6);

      this._enabled =
        enabled &&
        this._width > 1 &&
        this._height > 1 &&
        this._radius > 0 &&
        this._smoothing > 0;
      this.update_enabled();
      this.queue_repaint();
    }

    update_enabled() {
      this.set_enabled(!!this._enabled);
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
