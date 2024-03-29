import 'package:todo_list/json/color_bean.dart';
export 'package:todo_list/json/color_bean.dart';

///主题名、颜色、主题类型
class ThemeBean {
  String themeName;
  ColorBean colorBean;
  String themeType;

  ThemeBean({this.themeName, this.colorBean, this.themeType});

  static ThemeBean fromMap(Map<String, dynamic> map) {
    ThemeBean bean = new ThemeBean();
    bean.themeName = map['themeName'];
    bean.colorBean = ColorBean.fromMap(map['colorBean']);
    bean.themeType = map['themeType'];
    return bean;
  }

  Map<dynamic, dynamic> toMap() {
    return {
      'themeName': themeName,
      'colorBean': colorBean.toMap(),
      'themeType': themeType
    };
  }

  @override
  bool operator ==(other) {
    return other.themeName == themeName;
  }


}
