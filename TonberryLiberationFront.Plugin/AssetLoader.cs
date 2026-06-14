using Dalamud.Interface;
using Dalamud.Interface.ManagedFontAtlas;
using Dalamud.Plugin.Services;
using Dalamud.Interface.Textures;
using System.Collections.Generic;
using System.IO;

namespace TonberryLiberationFront.Plugin;

public class AssetLoader : System.IDisposable
{
    private readonly ITextureProvider textures;
    private readonly IPluginLog log;
    private readonly string resourcesDir;

    public Dictionary<string, ISharedImmediateTexture> Textures { get; } = new();

    // Fonts
    public IFontHandle? FontEorzea { get; private set; }

    public AssetLoader(ITextureProvider tex, IPluginLog l, string pluginDir)
    {
        textures = tex;
        log = l;
        resourcesDir = Path.Combine(pluginDir, "Resources");

        LoadTextures();
        BuildFonts();
    }

    private void LoadTextures()
    {
        var toLoad = new[]
        {
            "helm-avatar.png",
            "onion-sigil.png",
            "onion-sigil-mask.png",
            "wordmark.png",
            "portraits/portrait-combat.png",
            "portraits/portrait-combat-alt.png",
            "portraits/portrait-danger.png",
            "portraits/portrait-danger-alt.png"
        };

        foreach (var file in toLoad)
        {
            var path = Path.Combine(resourcesDir, file.Replace('/', Path.DirectorySeparatorChar));
            if (File.Exists(path))
            {
                var wrap = textures.GetFromFile(path);
                Textures[Path.GetFileNameWithoutExtension(file)] = wrap;
            }
            else
            {
                log.Warning($"Missing asset: {file}");
            }
        }
    }

    private void BuildFonts()
    {
        var fontsDir = Path.Combine(resourcesDir, "fonts");
        var eorzeaPath = Path.Combine(fontsDir, "Eorzea.ttf");

        if (File.Exists(eorzeaPath))
        {
            FontEorzea = Plugin.PluginInterface.UiBuilder.FontAtlas.NewDelegateFontHandle(e =>
                e.OnPreBuild(tk => tk.AddFontFromFile(eorzeaPath, new SafeFontConfig { SizePx = 24 })));
        }
    }

    public void Dispose()
    {
        FontEorzea?.Dispose();
        Textures.Clear();
    }
}
