using System;
using System.Reflection;

class Program {
    static void Main() {
        var dll = @"C:\Users\User\AppData\Roaming\XIVLauncher\addon\Hooks\dev\Dalamud.dll";
        var asm = Assembly.LoadFrom(dll);
        var type = asm.GetType("Dalamud.Interface.Textures.TextureWraps.IDalamudTextureWrap");
        if (type == null) {
            Console.WriteLine("Type not found");
            return;
        }
        foreach (var prop in type.GetProperties()) {
            Console.WriteLine(prop.Name + " : " + prop.PropertyType.Name);
        }
        foreach (var method in type.GetMethods()) {
            Console.WriteLine(method.Name);
        }
        
        var texType = asm.GetType("Dalamud.Interface.Textures.ISharedImmediateTexture");
        if (texType != null) {
            foreach (var prop in texType.GetProperties()) {
                Console.WriteLine("ISharedImmediateTexture " + prop.Name + " : " + prop.PropertyType.Name);
            }
            foreach (var method in texType.GetMethods()) {
                Console.WriteLine("ISharedImmediateTexture " + method.Name);
            }
        }
    }
}
