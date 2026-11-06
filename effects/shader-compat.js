import Clutter from 'gi://Clutter';
import Cogl from 'gi://Cogl';
import GObject from 'gi://GObject';

// GNOME 51 removed Clutter.ShaderEffect.set_shader_source().
// This shim preserves that call via vfunc_get_static_snippet() + Cogl.Snippet.
// A unique GTypeName is required: GJS derives type names from the module path,
// which would otherwise collide with other extensions shipping effects/shader-compat.js.
let ShaderShim = globalThis.__d2dShaderShim;
if (!ShaderShim) {
  ShaderShim = GObject.registerClass(
    { GTypeName: 'D2DAShaderShim' },
    class ShaderShim extends Clutter.ShaderEffect {
      set_shader_source(source) {
        this._compatSource = source;
        this.queue_repaint();
      }

      vfunc_get_static_snippet() {
        const source = this._compatSource;
        if (!source)
          return null;

        // Cogl binds layer 0 to the sampler named "cogl_sampler".
        const src = source.replace(/\btex\b/g, 'cogl_sampler');
        const mainIdx = src.search(/void\s+main\s*\(/);
        if (mainIdx < 0)
          return null;

        const declarations = src.slice(0, mainIdx);
        const open = src.indexOf('{', mainIdx);
        const close = src.lastIndexOf('}');
        if (open < 0 || close <= open)
          return null;

        const body = src.slice(open + 1, close);
        const snippet = Cogl.Snippet.new(Cogl.SnippetHook.FRAGMENT, declarations, null);
        snippet.set_replace(body);
        return snippet;
      }
    });
  globalThis.__d2dShaderShim = ShaderShim;
}

export { ShaderShim };