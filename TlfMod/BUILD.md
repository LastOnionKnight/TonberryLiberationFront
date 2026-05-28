# Building & Packing TlfMod

This mod is packaged via the Aetherment in-game plugin. Because there is no native Windows standalone CLI for Aetherment bundled with the plugin, we use the in-game UI to export a `.pcp` distributable.

## 1. Import the Project into Aetherment

1. Launch FFXIV and open the Aetherment interface (`/aetherment`).
2. Navigate to the **Projects** tab or use the **Import Project** button.
3. When prompted for the source folder, point it to this exact directory:
   ```
   D:\TonberryLiberationFront\TlfMod\
   ```
   *Note: Aetherment will read the `meta.yaml` from this folder to populate the colors, window styles, and options UI.*

## 2. Pack the Mod

1. Once imported, select the **Tonberry Liberation Front** project in Aetherment.
2. Click **Pack / Export** to generate the distributable artifact.
3. **Output Artifact:** Aetherment will produce a `.pcp` file (e.g., `TonberryLiberationFront.pcp`).
4. **Output Location:** The `.pcp` file will typically be saved to your configured Aetherment export directory, usually inside `%APPDATA%\XIVLauncher\pluginConfigs\Aetherment\Exports\` or directly in the `TlfMod` directory if Aetherment prompts for a save destination. Save it to `D:\TonberryLiberationFront\TlfMod\dist\` for consistency.

## 3. Distribution (Custom Repo)

To distribute this mod via the Aetherment custom repo:

1. Move the generated `.pcp` file to `D:\TonberryLiberationFront\TlfMod\dist\`.
2. Create or update the `repo_mod.json` (Aetherment custom repo manifest) in the root of the `LastOnionKnight/TonberryLiberationFront` GitHub repository.
3. Push the `.pcp` file to a GitHub Release (e.g., `tlf-mod-v0.1.0`).
4. Ensure the `repo_mod.json` points to the exact GitHub Release download URL for the `.pcp` file.
5. Users can then add your custom repo URL to their Aetherment settings to receive automatic updates!
